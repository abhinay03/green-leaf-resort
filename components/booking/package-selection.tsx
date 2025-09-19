"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Check, Clock, Star } from "lucide-react"
import type { BookingData } from "./booking-flow"

interface PackageSelectionProps {
  bookingData: BookingData
  setBookingData: (data: BookingData) => void
}

export function PackageSelection({ bookingData, setBookingData }: PackageSelectionProps) {
  const [packages, setPackages] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch packages from API with cache-busting
    const fetchPackages = async () => {
      try {
        const response = await fetch(`/api/packages?t=${Date.now()}`, {
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch packages');
        }
        
        const data = await response.json();
        setPackages(data);
      } catch (err) {
        console.error("Failed to fetch packages:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPackages();
  }, [])

  const selectPackage = (pkg: any) => {
    const newPackage = bookingData.package?.id === pkg.id ? null : pkg
    const basePrice = bookingData.accommodation?.price_per_night || 0
    const nights =
      bookingData.checkIn && bookingData.checkOut
        ? Math.ceil((bookingData.checkOut.getTime() - bookingData.checkIn.getTime()) / (1000 * 60 * 60 * 24))
        : 0

    setBookingData({
      ...bookingData,
      package: newPackage,
      totalAmount: basePrice * nights + (newPackage?.price || 0),
    })
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Add Package (Optional)</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 h-48 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Add Package (Optional)</h2>
        <p className="text-gray-600">Enhance your stay with our curated experience packages</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {packages.map((pkg: any) => (
          <Card
            key={pkg.id}
            className={`cursor-pointer transition-all duration-200 ${
              bookingData.package?.id === pkg.id ? "ring-2 ring-emerald-600 shadow-lg" : "hover:shadow-lg"
            }`}
            onClick={() => selectPackage(pkg)}
          >
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{pkg.name}</h3>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary">
                      <Clock className="h-3 w-3 mr-1" />
                      {pkg.duration_days} day{pkg.duration_days > 1 ? "s" : ""}
                    </Badge>
                    <Badge variant="outline">
                      <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                      Premium
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-emerald-600">₹{pkg.price}</div>
                  <div className="text-sm text-gray-500">total package</div>
                </div>
              </div>

              <p className="text-gray-600 mb-4">{pkg.description}</p>

              <div className="space-y-2 mb-4">
                <h4 className="font-semibold text-gray-900">Includes:</h4>
                {pkg.includes?.map((item: string, index: number) => (
                  <div key={index} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-600" />
                    <span className="text-sm text-gray-600">{item}</span>
                  </div>
                ))}
              </div>

              {bookingData.package?.id === pkg.id ? (
                <div className="p-3 bg-emerald-50 rounded-lg">
                  <div className="flex items-center gap-2 text-emerald-700">
                    <Check className="h-4 w-4" />
                    <span className="font-medium">Package Selected</span>
                  </div>
                </div>
              ) : (
                <Button
                  variant="outline"
                  className="w-full bg-transparent"
                  onClick={(e) => {
                    e.stopPropagation()
                    selectPackage(pkg)
                  }}
                >
                  Add Package
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Skip Package Option */}
      <Card className="border-dashed">
        <CardContent className="p-6 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Package</h3>
          <p className="text-gray-600 mb-4">Continue with accommodation only</p>
          <Button
            variant="ghost"
            onClick={() => selectPackage(null)}
            className={bookingData.package === null ? "bg-emerald-50 text-emerald-700" : ""}
          >
            {bookingData.package === null ? "Selected" : "Skip Package"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
