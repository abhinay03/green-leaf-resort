"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import type { BookingData } from "./booking-flow"

interface GuestDetailsProps {
  bookingData: BookingData
  setBookingData: (data: BookingData) => void
}

export function GuestDetails({ bookingData, setBookingData }: GuestDetailsProps) {
  const updateGuestDetails = (field: string, value: string) => {
    setBookingData({
      ...bookingData,
      guestDetails: {
        ...bookingData.guestDetails,
        [field]: value,
      },
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Guest Details</h2>
        <p className="text-gray-600">Please provide your contact information for the booking</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                value={bookingData.guestDetails.firstName}
                onChange={(e) => updateGuestDetails("firstName", e.target.value)}
                placeholder="Enter your first name"
                required
              />
            </div>

            <div>
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                value={bookingData.guestDetails.lastName}
                onChange={(e) => updateGuestDetails("lastName", e.target.value)}
                placeholder="Enter your last name"
                required
              />
            </div>

            <div>
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={bookingData.guestDetails.email}
                onChange={(e) => updateGuestDetails("email", e.target.value)}
                placeholder="your.email@example.com"
                required
              />
            </div>

            <div>
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                value={bookingData.guestDetails.phone}
                onChange={(e) => updateGuestDetails("phone", e.target.value)}
                placeholder="+91 98765 43210"
                required
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="specialRequests">Special Requests (Optional)</Label>
              <Textarea
                id="specialRequests"
                value={bookingData.guestDetails.specialRequests}
                onChange={(e) => updateGuestDetails("specialRequests", e.target.value)}
                placeholder="Any special requirements, dietary restrictions, or requests..."
                rows={4}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <h3 className="font-semibold text-blue-900 mb-2">Important Information</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Check-in time: 2:00 PM | Check-out time: 11:00 AM</li>
            <li>• Valid ID proof required at check-in</li>
            <li>• Cancellation policy: Free cancellation up to 24 hours before check-in</li>
            <li>• For group bookings (8+ guests), please contact us directly</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
