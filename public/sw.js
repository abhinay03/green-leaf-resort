const CACHE_NAME = "green-leaf-resorts-v1"
const STATIC_CACHE = "static-v1"
const DYNAMIC_CACHE = "dynamic-v1"

// Assets to cache immediately
const STATIC_ASSETS = [
  "/",
  "/book",
  "/admin/login",
  "/admin/dashboard",
  "/offline",
  "/manifest.json",
  // Add your static assets here
]

// API endpoints to cache
const API_CACHE_PATTERNS = ["/api/accommodations", "/api/packages", "/api/bookings"]

// Install event - cache static assets
self.addEventListener("install", (event) => {
  console.log("[SW] Installing service worker")

  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => {
        console.log("[SW] Caching static assets")
        return cache.addAll(STATIC_ASSETS)
      })
      .then(() => {
        return self.skipWaiting()
      }),
  )
})

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("[SW] Activating service worker")

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log("[SW] Deleting old cache:", cacheName)
              return caches.delete(cacheName)
            }
          }),
        )
      })
      .then(() => {
        return self.clients.claim()
      }),
  )
})

// Fetch event - serve from cache or network
self.addEventListener("fetch", (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Handle API requests
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(handleApiRequest(request))
    return
  }

  // Handle navigation requests
  if (request.mode === "navigate") {
    event.respondWith(handleNavigationRequest(request))
    return
  }

  // Handle other requests (static assets)
  event.respondWith(handleStaticRequest(request))
})

// Handle API requests with network-first strategy
async function handleApiRequest(request) {
  const url = new URL(request.url)

  try {
    // Try network first
    const networkResponse = await fetch(request)

    // Cache successful GET requests
    if (request.method === "GET" && networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE)
      cache.put(request, networkResponse.clone())
    }

    return networkResponse
  } catch (error) {
    console.log("[SW] Network failed, trying cache for:", url.pathname)

    // If network fails, try cache for GET requests
    if (request.method === "GET") {
      const cachedResponse = await caches.match(request)
      if (cachedResponse) {
        return cachedResponse
      }
    }

    // For POST requests (bookings), store in IndexedDB for later sync
    if (request.method === "POST" && url.pathname === "/api/bookings") {
      const bookingData = await request.json()
      await storeOfflineBooking(bookingData)

      return new Response(
        JSON.stringify({
          success: true,
          offline: true,
          message: "Booking saved offline. Will sync when online.",
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    throw error
  }
}

// Handle navigation requests
async function handleNavigationRequest(request) {
  try {
    const networkResponse = await fetch(request)
    return networkResponse
  } catch (error) {
    // Serve offline page for navigation failures
    const cache = await caches.open(STATIC_CACHE)
    const offlinePage = await cache.match("/offline")
    return offlinePage || new Response("Offline", { status: 200 })
  }
}

// Handle static requests with cache-first strategy
async function handleStaticRequest(request) {
  // Skip non-http/s requests (like chrome-extension:)
  if (!request.url.startsWith('http')) {
    console.log('[SW] Skipping non-http request:', request.url);
    return fetch(request);
  }

  // Skip Vercel analytics
  if (request.url.includes('_vercel/insights')) {
    console.log('[SW] Skipping Vercel analytics');
    return new Response(null, { status: 200 });
  }

  try {
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }

    const networkResponse = await fetch(request)

    // Only cache successful responses and GET requests
    if (networkResponse.ok && request.method === 'GET') {
      try {
        const cache = await caches.open(DYNAMIC_CACHE)
        await cache.put(request, networkResponse.clone())
      } catch (cacheError) {
        console.error('[SW] Cache put error:', cacheError)
      }
    }

    return networkResponse
  } catch (error) {
    console.log('[SW] Failed to fetch:', request.url, error)
    // Return a fallback response for failed requests
    if (request.mode === 'navigate') {
      const cache = await caches.open(STATIC_CACHE)
      const offlinePage = await cache.match('/offline')
      if (offlinePage) return offlinePage
    }
    return new Response('Network error', { status: 408, statusText: 'Network error' })
  }
}

// Store offline booking in IndexedDB
async function storeOfflineBooking(bookingData) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("OfflineBookings", 1)

    request.onerror = () => reject(request.error)

    request.onsuccess = () => {
      const db = request.result
      const transaction = db.transaction(["bookings"], "readwrite")
      const store = transaction.objectStore("bookings")

      const offlineBooking = {
        ...bookingData,
        offline_id: `offline_${Date.now()}`,
        created_offline: true,
        sync_status: "pending",
      }

      store.add(offlineBooking)

      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error)
    }

    request.onupgradeneeded = () => {
      const db = request.result
      const store = db.createObjectStore("bookings", { keyPath: "offline_id" })
      store.createIndex("sync_status", "sync_status", { unique: false })
    }
  })
}

// Background sync for offline bookings
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-bookings") {
    event.waitUntil(syncOfflineBookings())
  }
})

// Sync offline bookings when online
async function syncOfflineBookings() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("OfflineBookings", 1)

    request.onsuccess = async () => {
      const db = request.result
      const transaction = db.transaction(["bookings"], "readwrite")
      const store = transaction.objectStore("bookings")
      const index = store.index("sync_status")

      const pendingBookings = await new Promise((resolve) => {
        const bookings = []
        const cursor = index.openCursor("pending")

        cursor.onsuccess = (event) => {
          const cursor = event.target.result
          if (cursor) {
            bookings.push(cursor.value)
            cursor.continue()
          } else {
            resolve(bookings)
          }
        }
      })

      // Sync each pending booking
      for (const booking of pendingBookings) {
        try {
          const response = await fetch("/api/bookings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(booking),
          })

          if (response.ok) {
            // Mark as synced
            booking.sync_status = "synced"
            store.put(booking)
            console.log("[SW] Synced offline booking:", booking.offline_id)
          }
        } catch (error) {
          console.log("[SW] Failed to sync booking:", booking.offline_id, error)
        }
      }

      resolve()
    }

    request.onerror = () => reject(request.error)
  })
}

// Listen for messages from the main thread
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting()
  }
})
