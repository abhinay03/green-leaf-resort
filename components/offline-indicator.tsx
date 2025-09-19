"use client"

import { useEffect, useState } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { WifiOff, Wifi, RefreshCw } from "lucide-react"

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true)
  const [showOfflineAlert, setShowOfflineAlert] = useState(false)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      setShowOfflineAlert(false)
      // Trigger background sync when coming back online
      if ("serviceWorker" in navigator && "sync" in window.ServiceWorkerRegistration.prototype) {
        navigator.serviceWorker.ready.then((registration) => {
          return registration.sync.register("sync-bookings")
        })
      }
    }

    const handleOffline = () => {
      setIsOnline(false)
      setShowOfflineAlert(true)
    }

    // Set initial state
    setIsOnline(navigator.onLine)

    // Add event listeners
    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  if (!showOfflineAlert && isOnline) {
    return null
  }

  return (
    <div className="fixed top-16 left-0 right-0 z-40 p-4">
      <Alert
        className={`max-w-md mx-auto ${isOnline ? "border-green-200 bg-green-50" : "border-orange-200 bg-orange-50"}`}
      >
        <div className="flex items-center gap-2">
          {isOnline ? <Wifi className="h-4 w-4 text-green-600" /> : <WifiOff className="h-4 w-4 text-orange-600" />}
          <AlertDescription className={isOnline ? "text-green-800" : "text-orange-800"}>
            {isOnline ? (
              <div className="flex items-center justify-between w-full">
                <span>You're back online! Syncing data...</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowOfflineAlert(false)}
                  className="text-green-600 hover:text-green-700"
                >
                  ×
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between w-full">
                <span>You're offline. Bookings will sync when reconnected.</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => window.location.reload()}
                  className="text-orange-600 hover:text-orange-700"
                >
                  <RefreshCw className="h-3 w-3" />
                </Button>
              </div>
            )}
          </AlertDescription>
        </div>
      </Alert>
    </div>
  )
}
