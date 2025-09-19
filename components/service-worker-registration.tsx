"use client"

import { useEffect } from "react"
import { syncManager } from "@/lib/offline-storage"

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("SW registered: ", registration)

          // Preload data for offline use
          syncManager.preloadData()

          // Listen for updates
          registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing
            if (newWorker) {
              newWorker.addEventListener("statechange", () => {
                if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                  // New content is available, prompt user to refresh
                  if (confirm("New version available! Refresh to update?")) {
                    newWorker.postMessage({ type: "SKIP_WAITING" })
                    window.location.reload()
                  }
                }
              })
            }
          })
        })
        .catch((registrationError) => {
          console.log("SW registration failed: ", registrationError)
        })

      // Handle service worker messages
      navigator.serviceWorker.addEventListener("message", (event) => {
        if (event.data && event.data.type === "SYNC_COMPLETE") {
          console.log("Background sync completed")
        }
      })
    }

    // Handle online/offline events
    const handleOnline = () => {
      console.log("Back online, syncing data...")
      syncManager.syncPendingBookings()
    }

    window.addEventListener("online", handleOnline)

    return () => {
      window.removeEventListener("online", handleOnline)
    }
  }, [])

  return null
}
