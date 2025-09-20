// Utility functions for offline storage and sync

export interface OfflineBooking {
  offline_id: string
  booking_id?: string
  accommodation_id: string
  package_id?: string | null
  check_in_date: string
  check_out_date: string
  guests: number
  total_amount: number
  guest_name: string
  guest_email: string
  guest_phone: string
  special_requests?: string
  status?: string
  created_offline?: boolean
  sync_status?: "pending" | "synced" | "failed"
  created_at: string
}

class OfflineStorage {
  private dbName = "GreenLeafResorts"
  private version = 1

  async openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)

      request.onupgradeneeded = () => {
        const db = request.result

        // Create bookings store
        if (!db.objectStoreNames.contains("bookings")) {
          const bookingsStore = db.createObjectStore("bookings", { keyPath: "offline_id" })
          bookingsStore.createIndex("sync_status", "sync_status", { unique: false })
          bookingsStore.createIndex("created_at", "created_at", { unique: false })
        }

        // Create accommodations cache
        if (!db.objectStoreNames.contains("accommodations")) {
          const accommodationsStore = db.createObjectStore("accommodations", { keyPath: "id" })
          accommodationsStore.createIndex("type", "type", { unique: false })
        }

        // Create packages cache
        if (!db.objectStoreNames.contains("packages")) {
          const packagesStore = db.createObjectStore("packages", { keyPath: "id" })
        }
      }
    })
  }

  async storeOfflineBooking(
    bookingData: Omit<OfflineBooking, "offline_id" | "created_offline" | "sync_status" | "created_at"> & {
      booking_id?: string;
      status?: string;
      created_at?: string;
    },
  ): Promise<string> {
    const db = await this.openDB()
    const transaction = db.transaction(["bookings"], "readwrite")
    const store = transaction.objectStore("bookings")

    const offlineId = `offline_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    const now = new Date().toISOString()

    const offlineBooking: OfflineBooking = {
      ...bookingData,
      offline_id: offlineId,
      booking_id: bookingData.booking_id || `OFF-${now.slice(2, 4)}${now.slice(5, 7)}-${Math.floor(100 + Math.random() * 900)}`,
      status: bookingData.status || 'pending',
      created_offline: true,
      sync_status: "pending",
      created_at: bookingData.created_at || now,
    }

    return new Promise((resolve, reject) => {
      const request = store.add(offlineBooking)
      request.onsuccess = () => resolve(offlineId)
      request.onerror = () => reject(request.error)
    })
  }

  async getOfflineBookings(): Promise<OfflineBooking[]> {
    const db = await this.openDB()
    const transaction = db.transaction(["bookings"], "readonly")
    const store = transaction.objectStore("bookings")

    return new Promise((resolve, reject) => {
      const request = store.getAll()
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async getPendingBookings(): Promise<OfflineBooking[]> {
    const db = await this.openDB()
    const transaction = db.transaction(["bookings"], "readonly")
    const store = transaction.objectStore("bookings")
    const index = store.index("sync_status")

    return new Promise((resolve, reject) => {
      const request = index.getAll("pending")
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async updateBookingStatus(offlineId: string, status: "pending" | "synced" | "failed"): Promise<void> {
    const db = await this.openDB()
    const transaction = db.transaction(["bookings"], "readwrite")
    const store = transaction.objectStore("bookings")

    return new Promise((resolve, reject) => {
      const getRequest = store.get(offlineId)

      getRequest.onsuccess = () => {
        const booking = getRequest.result
        if (booking) {
          booking.sync_status = status
          const updateRequest = store.put(booking)
          updateRequest.onsuccess = () => resolve()
          updateRequest.onerror = () => reject(updateRequest.error)
        } else {
          reject(new Error("Booking not found"))
        }
      }

      getRequest.onerror = () => reject(getRequest.error)
    })
  }

  async cacheAccommodations(accommodations: any[]): Promise<void> {
    const db = await this.openDB()
    const transaction = db.transaction(["accommodations"], "readwrite")
    const store = transaction.objectStore("accommodations")

    return new Promise((resolve, reject) => {
      // Clear existing data
      store.clear()

      // Add new data
      accommodations.forEach((accommodation) => {
        store.add(accommodation)
      })

      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error)
    })
  }

  async getCachedAccommodations(): Promise<any[]> {
    const db = await this.openDB()
    const transaction = db.transaction(["accommodations"], "readonly")
    const store = transaction.objectStore("accommodations")

    return new Promise((resolve, reject) => {
      const request = store.getAll()
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async cachePackages(packages: any[]): Promise<void> {
    const db = await this.openDB()
    const transaction = db.transaction(["packages"], "readwrite")
    const store = transaction.objectStore("packages")

    return new Promise((resolve, reject) => {
      // Clear existing data
      store.clear()

      // Add new data
      packages.forEach((pkg) => {
        store.add(pkg)
      })

      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error)
    })
  }

  async getCachedPackages(): Promise<any[]> {
    const db = await this.openDB()
    const transaction = db.transaction(["packages"], "readonly")
    const store = transaction.objectStore("packages")

    return new Promise((resolve, reject) => {
      const request = store.getAll()
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }
}

export const offlineStorage = new OfflineStorage()

// Sync manager for handling online/offline sync
export class SyncManager {
  async syncPendingBookings(): Promise<void> {
    if (!navigator.onLine) {
      console.log("Cannot sync: offline")
      return
    }

    const pendingBookings = await offlineStorage.getPendingBookings()

    for (const booking of pendingBookings) {
      try {
        const response = await fetch("/api/bookings", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            accommodation_id: booking.accommodation_id,
            package_id: booking.package_id,
            check_in_date: booking.check_in_date,
            check_out_date: booking.check_out_date,
            guests: booking.guests,
            total_amount: booking.total_amount,
            guest_name: booking.guest_name,
            guest_email: booking.guest_email,
            guest_phone: booking.guest_phone,
            special_requests: booking.special_requests,
            offline_id: booking.offline_id,
          }),
        })

        if (response.ok) {
          await offlineStorage.updateBookingStatus(booking.offline_id, "synced")
          console.log("Synced offline booking:", booking.offline_id)
        } else {
          await offlineStorage.updateBookingStatus(booking.offline_id, "failed")
          console.error("Failed to sync booking:", booking.offline_id)
        }
      } catch (error) {
        await offlineStorage.updateBookingStatus(booking.offline_id, "failed")
        console.error("Error syncing booking:", booking.offline_id, error)
      }
    }
  }

  async preloadData(): Promise<void> {
    try {
      // Cache accommodations
      const accommodationsResponse = await fetch("/api/accommodations")
      if (accommodationsResponse.ok) {
        const accommodations = await accommodationsResponse.json()
        await offlineStorage.cacheAccommodations(accommodations)
      }

      // Cache packages
      const packagesResponse = await fetch("/api/packages")
      if (packagesResponse.ok) {
        const packages = await packagesResponse.json()
        await offlineStorage.cachePackages(packages)
      }
    } catch (error) {
      console.error("Error preloading data:", error)
    }
  }
}

export const syncManager = new SyncManager()
