"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, Calendar, Users, MapPin, Phone, Mail, CreditCard, WifiOff } from "lucide-react"
import { format } from "date-fns"
import type { BookingData } from "./booking-flow"
import { offlineStorage } from "@/lib/offline-storage"

interface BookingConfirmationProps {
  bookingData: BookingData
  setBookingData: (data: BookingData) => void
}

export function BookingConfirmation({ bookingData }: BookingConfirmationProps) {
  const [isBooking, setIsBooking] = useState(false)
  const [bookingComplete, setBookingComplete] = useState(false)
  const [bookingId, setBookingId] = useState("")
  const [isOfflineBooking, setIsOfflineBooking] = useState(false)

  const calculateNights = () => {
    if (bookingData.checkIn && bookingData.checkOut) {
      const diffTime = bookingData.checkOut.getTime() - bookingData.checkIn.getTime()
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    }
    return 0
  }

  const confirmBooking = async () => {
    setIsBooking(true)

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          accommodation_id: bookingData.accommodation.id,
          package_id: bookingData.package?.id || null,
          check_in_date: bookingData.checkIn?.toISOString().split("T")[0],
          check_out_date: bookingData.checkOut?.toISOString().split("T")[0],
          guests: bookingData.guests,
          total_amount: bookingData.totalAmount,
          guest_name: `${bookingData.guestDetails.firstName} ${bookingData.guestDetails.lastName}`,
          guest_email: bookingData.guestDetails.email,
          guest_phone: bookingData.guestDetails.phone,
          special_requests: bookingData.guestDetails.specialRequests,
        }),
      })

      if (response.ok) {
        const result = await response.json()

        if (response.ok) {
          // Check if this was an offline booking
          if (result.offline) {
            setIsOfflineBooking(true)
            // For offline, generate a temporary ID with OFFLINE prefix
            const now = new Date()
            const month = (now.getMonth() + 1).toString().padStart(2, '0')
            const sequence = Math.floor(Math.random() * 900) + 100 // Random 3-digit number
            setBookingId(`OFF-${now.getFullYear()}${month}-${sequence}`)
          } else {
            // Handle both direct booking_id and nested in booking object
            const bookingId = result.booking_id || (result.booking && result.booking.booking_id)
            if (bookingId) {
              setBookingId(bookingId)
            } else {
              console.warn('No booking ID found in response:', result)
              // Fallback to a generated ID if none found
              const now = new Date()
              const month = (now.getMonth() + 1).toString().padStart(2, '0')
              const sequence = Math.floor(Math.random() * 900) + 100
              setBookingId(`GEN-${now.getFullYear()}${month}-${sequence}`)
            }
          }

          setBookingComplete(true)
        } else {
          throw new Error(result.error || 'Failed to create booking')
        }
      } else {
        throw new Error("Booking failed")
      }
    } catch (error) {
      console.error("Booking error:", error)

      // If network fails, try to store offline
      if (!navigator.onLine) {
        try {
          const now = new Date()
          const month = (now.getMonth() + 1).toString().padStart(2, '0')
          const sequence = Math.floor(Math.random() * 900) + 100 // Random 3-digit number
          const offlineId = `OFF-${now.getFullYear()}${month}-${sequence}`
          
          const offlineBooking = {
            accommodation_id: bookingData.accommodation.id,
            package_id: bookingData.package?.id || null,
            check_in_date: bookingData.checkIn?.toISOString().split("T")[0] || "",
            check_out_date: bookingData.checkOut?.toISOString().split("T")[0] || "",
            guests: bookingData.guests,
            total_amount: bookingData.totalAmount,
            guest_name: `${bookingData.guestDetails.firstName} ${bookingData.guestDetails.lastName}`,
            guest_email: bookingData.guestDetails.email,
            guest_phone: bookingData.guestDetails.phone,
            special_requests: bookingData.guestDetails.specialRequests,
            status: 'pending',
            booking_id: offlineId,
            created_at: now.toISOString(),
          } as const
          
          await offlineStorage.storeOfflineBooking(offlineBooking)

          setIsOfflineBooking(true)
          setBookingId(offlineId)
          setBookingComplete(true)
        } catch (offlineError) {
          console.error("Offline storage failed:", offlineError)
          alert("Booking failed. Please check your connection and try again.")
        }
      } else {
        alert("Booking failed. Please try again.")
      }
    } finally {
      setIsBooking(false)
    }
  }

  if (bookingComplete) {
    return (
      <div className="text-center space-y-6">
        <div
          className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto ${
            isOfflineBooking ? "bg-orange-100" : "bg-emerald-100"
          }`}
        >
          {isOfflineBooking ? (
            <WifiOff className="h-10 w-10 text-orange-600" />
          ) : (
            <Check className="h-10 w-10 text-emerald-600" />
          )}
        </div>

        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {isOfflineBooking ? "Booking Saved Offline!" : "Booking Confirmed!"}
          </h2>
          <p className="text-gray-600">
            {isOfflineBooking
              ? "Your booking has been saved and will sync when you're back online"
              : "Your reservation has been successfully created"}
          </p>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="text-center mb-6 p-4 bg-gray-50 rounded-lg border border-dashed border-gray-200">
              <div className="text-sm font-medium text-gray-500 mb-1">Your Booking Reference</div>
              <div className={`text-2xl font-mono font-bold tracking-wider ${isOfflineBooking ? "text-orange-600" : "text-emerald-600"}`}>
                {bookingId || "Loading..."}
              </div>
              <div className="mt-2 text-xs text-gray-500">
                Please save this ID for your records
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Guest Name:</span>
                <span className="font-medium">
                  {bookingData.guestDetails.firstName} {bookingData.guestDetails.lastName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <span className="font-medium">{bookingData.guestDetails.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Check-in:</span>
                <span className="font-medium">{bookingData.checkIn ? format(bookingData.checkIn, "PPP") : ""}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Check-out:</span>
                <span className="font-medium">{bookingData.checkOut ? format(bookingData.checkOut, "PPP") : ""}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className={`p-6 rounded-lg ${isOfflineBooking ? "bg-orange-50" : "bg-emerald-50"}`}>
          <h3 className={`font-semibold mb-2 ${isOfflineBooking ? "text-orange-900" : "text-emerald-900"}`}>
            What's Next?
          </h3>
          <ul className={`text-sm space-y-1 text-left ${isOfflineBooking ? "text-orange-800" : "text-emerald-800"}`}>
            {isOfflineBooking ? (
              <>
                <li>• Your booking is saved locally on your device</li>
                <li>• It will automatically sync when you're back online</li>
                <li>• You'll receive a confirmation email once synced</li>
                <li>• Keep your booking ID for reference</li>
              </>
            ) : (
              <>
                <li>• A confirmation email has been sent to your email address</li>
                <li>• Please save your booking ID for future reference</li>
                <li>• Our team will contact you 24 hours before check-in</li>
                <li>• Bring a valid ID proof for check-in</li>
              </>
            )}
          </ul>
        </div>

        <Button
          onClick={() => (window.location.href = "/")}
          className={isOfflineBooking ? "bg-orange-600 hover:bg-orange-700" : "bg-emerald-600 hover:bg-emerald-700"}
        >
          Return to Home
        </Button>
      </div>
    )
  }

  const nights = calculateNights()
  const basePrice = bookingData.accommodation?.price_per_night * nights
  const packagePrice = bookingData.package?.price || 0

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Confirm Your Booking</h2>
        <p className="text-gray-600">Please review your booking details before confirming</p>
      </div>

      {/* Booking Summary */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Summary</h3>

          <div className="space-y-4">
            {/* Accommodation */}
            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
              <img
                src={bookingData.accommodation?.images?.[0] || "/placeholder.svg"}
                alt={bookingData.accommodation?.name}
                className="w-16 h-16 rounded-lg object-cover"
              />
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">{bookingData.accommodation?.name}</h4>
                <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {bookingData.checkIn ? format(bookingData.checkIn, "MMM dd") : ""} -{" "}
                    {bookingData.checkOut ? format(bookingData.checkOut, "MMM dd") : ""}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {bookingData.guests} guest{bookingData.guests > 1 ? "s" : ""}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-gray-900">₹{basePrice}</div>
                <div className="text-sm text-gray-500">
                  {nights} night{nights > 1 ? "s" : ""}
                </div>
              </div>
            </div>

            {/* Package */}
            {bookingData.package && (
              <div className="flex items-start gap-4 p-4 bg-emerald-50 rounded-lg">
                <div className="w-16 h-16 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <Check className="h-8 w-8 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{bookingData.package.name}</h4>
                  <p className="text-sm text-gray-600 mt-1">{bookingData.package.description}</p>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">₹{packagePrice}</div>
                  <div className="text-sm text-gray-500">package</div>
                </div>
              </div>
            )}

            {/* Guest Details */}
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3">Guest Information</h4>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span>
                    {bookingData.guestDetails.firstName} {bookingData.guestDetails.lastName}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span>{bookingData.guestDetails.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span>{bookingData.guestDetails.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span>
                    {bookingData.guests} guest{bookingData.guests > 1 ? "s" : ""}
                  </span>
                </div>
              </div>
              {bookingData.guestDetails.specialRequests && (
                <div className="mt-3 p-3 bg-gray-50 rounded">
                  <div className="text-sm font-medium text-gray-700">Special Requests:</div>
                  <div className="text-sm text-gray-600">{bookingData.guestDetails.specialRequests}</div>
                </div>
              )}
            </div>

            {/* Total */}
            <div className="border-t pt-4">
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total Amount</span>
                <span className="text-emerald-600">₹{bookingData.totalAmount}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Method */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h3>
          <div className="p-4 border rounded-lg bg-blue-50">
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-blue-600" />
              <div>
                <div className="font-medium text-blue-900">Pay at Resort</div>
                <div className="text-sm text-blue-700">Payment will be collected during check-in</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Offline Notice */}
      {!navigator.onLine && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <WifiOff className="h-5 w-5 text-orange-600" />
              <div>
                <div className="font-medium text-orange-900">You're currently offline</div>
                <div className="text-sm text-orange-700">
                  Your booking will be saved locally and synced when you're back online
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Confirm Button */}
      <Button
        onClick={confirmBooking}
        disabled={isBooking}
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 text-lg"
      >
        {isBooking ? "Processing..." : "Confirm Booking"}
      </Button>
    </div>
  )
}
