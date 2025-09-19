import { Card, CardContent } from "@/components/ui/card"
import { Calendar, Users, MapPin } from "lucide-react"
import { format } from "date-fns"
import type { BookingData } from "./booking-flow"

interface BookingSummaryProps {
  bookingData: BookingData
}

export function BookingSummary({ bookingData }: BookingSummaryProps) {
  const calculateNights = () => {
    if (bookingData.checkIn && bookingData.checkOut) {
      const diffTime = bookingData.checkOut.getTime() - bookingData.checkIn.getTime()
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    }
    return 0
  }

  const nights = calculateNights()
  const basePrice = bookingData.accommodation?.price_per_night * nights || 0
  const packagePrice = bookingData.package?.price || 0

  return (
    <div className="sticky top-4">
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Summary</h3>

          {bookingData.accommodation ? (
            <div className="space-y-4">
              {/* Accommodation */}
              <div className="flex gap-3">
                <img
                  src={bookingData.accommodation.images?.[0] || "/placeholder.svg"}
                  alt={bookingData.accommodation.name}
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{bookingData.accommodation.name}</h4>
                  <p className="text-sm text-gray-600">{bookingData.accommodation.type.replace("_", " ")}</p>
                </div>
              </div>

              {/* Dates */}
              {bookingData.checkIn && bookingData.checkOut && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {format(bookingData.checkIn, "MMM dd")} - {format(bookingData.checkOut, "MMM dd")}
                  </span>
                </div>
              )}

              {/* Guests */}
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users className="h-4 w-4" />
                <span>
                  {bookingData.guests} guest{bookingData.guests > 1 ? "s" : ""}
                </span>
              </div>

              {/* Package */}
              {bookingData.package && (
                <div className="p-3 bg-emerald-50 rounded-lg">
                  <div className="font-medium text-emerald-900">{bookingData.package.name}</div>
                  <div className="text-sm text-emerald-700">₹{bookingData.package.price}</div>
                </div>
              )}

              {/* Price Breakdown */}
              {nights > 0 && (
                <div className="space-y-2 pt-4 border-t">
                  <div className="flex justify-between text-sm">
                    <span>
                      ₹{bookingData.accommodation.price_per_night} × {nights} night{nights > 1 ? "s" : ""}
                    </span>
                    <span>₹{basePrice}</span>
                  </div>
                  {packagePrice > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Package</span>
                      <span>₹{packagePrice}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                    <span>Total</span>
                    <span className="text-emerald-600">₹{bookingData.totalAmount}</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              <MapPin className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>Select an accommodation to see booking summary</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
