"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Accommodation {
  id: string
  name: string
  description: string
  price: number
  capacity: number
  image_url: string
  amenities?: string[]
  // Add other properties that your accommodation object has
}
import { Users, Wifi, Car, Coffee, Tv, Bath, WifiOff } from "lucide-react"
import type { BookingData } from "./booking-flow"
import { offlineStorage } from "@/lib/offline-storage"

interface AccommodationSelectionProps {
  bookingData: BookingData
  setBookingData: (data: BookingData) => void
  onNext?: () => void
}

export function AccommodationSelection({ bookingData, setBookingData, onNext }: AccommodationSelectionProps) {
  const [accommodations, setAccommodations] = useState<Accommodation[]>([])
  const [loading, setLoading] = useState(true)
  const [isOffline, setIsOffline] = useState(false)

  useEffect(() => {
    fetchAccommodations()
  }, [])

  const fetchAccommodations = async () => {
    try {
      const response = await fetch("/api/accommodations")
      const data = await response.json()
      setAccommodations(data)

      // Cache for offline use
      await offlineStorage.cacheAccommodations(data)
      setLoading(false)
    } catch (err) {
      console.error("Failed to fetch accommodations:", err)

      // Try to load from cache if offline
      try {
        const cachedData = await offlineStorage.getCachedAccommodations()
        if (cachedData.length > 0) {
          setAccommodations(cachedData)
          setIsOffline(true)
        }
      } catch (cacheError) {
        console.error("Failed to load cached accommodations:", cacheError)
      }

      setLoading(false)
    }
  }

  const selectAccommodation = (accommodation: any) => {
    setBookingData({
      ...bookingData,
      accommodation,
      totalAmount: accommodation.price_per_night,
    })
    // Automatically proceed to next step after selection
    if (onNext) {
      onNext()
    }
  }

  const getFeatureIcon = (feature: string) => {
    switch (feature.toLowerCase()) {
      case "tv":
        return Tv
      case "bath":
        return Bath
      case "wifi":
        return Wifi
      case "coffee":
        return Coffee
      case "users":
        return Users
      case "car":
        return Car
      default:
        return Coffee
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Choose Your Accommodation</h2>
        <div className="grid gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 h-64 rounded-lg mb-4"></div>
              <div className="bg-gray-200 h-4 rounded mb-2"></div>
              <div className="bg-gray-200 h-4 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <h2 className="text-2xl font-bold text-gray-900">Choose Your Accommodation</h2>
          {isOffline && (
            <Badge variant="outline" className="text-orange-600 border-orange-200">
              <WifiOff className="h-3 w-3 mr-1" />
              Offline
            </Badge>
          )}
        </div>
        <p className="text-gray-600">
          Select the perfect stay for your getaway
          {isOffline && " (showing cached data)"}
        </p>
      </div>

      <div className="grid gap-6">
        {accommodations.map((accommodation: any) => (
          <Card
            key={accommodation.id}
            className={`overflow-hidden cursor-pointer transition-all duration-200 ${
              bookingData.accommodation?.id === accommodation.id
                ? "ring-2 ring-emerald-600 shadow-lg"
                : "hover:shadow-lg"
            }`}
            onClick={() => selectAccommodation(accommodation)}
          >
            <div className="md:flex">
              <div className="md:w-1/3">
                <img
                  src={accommodation.images?.[0] || "/placeholder.svg"}
                  alt={accommodation.name}
                  className="w-full h-48 md:h-full object-cover"
                />
              </div>

              <CardContent className="md:w-2/3 p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{accommodation.name}</h3>
                    <Badge variant="secondary" className="mb-2">
                      {accommodation.type}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-emerald-600">
                      ₹{accommodation.price_per_night.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500">per person</div>
                  </div>
                </div>

                <p className="text-gray-600 mb-4 line-clamp-2">{accommodation.description}</p>

                <div className="flex flex-wrap gap-2 mb-4">
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Users className="h-4 w-4" />
                    {accommodation.max_guests} guests
                  </div>
                  {accommodation.amenities?.slice(0, 3).map((amenity: string, index: number) => {
                    const IconComponent = getFeatureIcon(amenity)
                    return (
                      <div key={index} className="flex items-center gap-1 text-sm text-gray-600">
                        <IconComponent className="h-4 w-4" />
                        {amenity}
                      </div>
                    )
                  })}
                  {accommodation.amenities?.length > 3 && (
                    <div className="text-sm text-gray-500">+{accommodation.amenities.length - 3} more</div>
                  )}
                </div>

                {bookingData.accommodation?.id === accommodation.id && (
                  <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">Selected</Badge>
                )}
              </CardContent>
            </div>
          </Card>
        ))}
      </div>

      {accommodations.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-2">No accommodations available</div>
          {isOffline && (
            <div className="text-sm text-orange-600">Please check your internet connection and try again</div>
          )}
        </div>
      )}
    </div>
  )
}
