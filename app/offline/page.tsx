"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { WifiOff, RefreshCw, Home } from "lucide-react"
import Link from "next/link"

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardContent className="p-8">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <WifiOff className="h-10 w-10 text-gray-400" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-4">You're Offline</h1>
          <p className="text-gray-600 mb-6">
            It looks like you've lost your internet connection. Don't worry, you can still browse cached content and
            make bookings that will sync when you're back online.
          </p>

          <div className="space-y-3">
            <Button onClick={() => window.location.reload()} className="w-full bg-emerald-600 hover:bg-emerald-700">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>

            <Link href="/" className="block">
              <Button variant="outline" className="w-full bg-transparent">
                <Home className="h-4 w-4 mr-2" />
                Go to Homepage
              </Button>
            </Link>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Offline Features Available:</strong>
              <br />• Browse accommodations and packages
              <br />• Make bookings (will sync when online)
              <br />• View cached content
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
