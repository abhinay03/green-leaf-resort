"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Users, Plus, Minus } from "lucide-react"
import { format } from "date-fns"
import type { BookingData } from "./booking-flow"

interface DateGuestSelectionProps {
  bookingData: BookingData
  setBookingData: (data: BookingData) => void
}

export function DateGuestSelection({ bookingData, setBookingData }: DateGuestSelectionProps) {
  const [checkInOpen, setCheckInOpen] = useState(false)
  const [checkOutOpen, setCheckOutOpen] = useState(false)

  const updateCheckIn = (date: Date | undefined) => {
    if (date) {
      const newData = {
        ...bookingData,
        checkIn: date,
        checkOut: bookingData.checkOut && bookingData.checkOut <= date ? null : bookingData.checkOut,
      }
      setBookingData(newData)
      setCheckInOpen(false)
    }
  }

  const updateCheckOut = (date: Date | undefined) => {
    if (date) {
      const newData = {
        ...bookingData,
        checkOut: date,
      }
      setBookingData(newData)
      setCheckOutOpen(false)
    }
  }

  const updateGuests = (change: number) => {
    const newGuests = Math.max(1, Math.min(bookingData.guests + change, bookingData.accommodation?.capacity || 10))
    setBookingData({
      ...bookingData,
      guests: newGuests,
    })
  }

  const calculateNights = () => {
    if (bookingData.checkIn && bookingData.checkOut) {
      const diffTime = bookingData.checkOut.getTime() - bookingData.checkIn.getTime()
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    }
    return 0
  }

  const calculateTotal = () => {
    const nights = calculateNights()
    const basePrice = bookingData.accommodation?.price_per_night || 0
    const packagePrice = bookingData.package?.price || 0
    return basePrice * nights + packagePrice
  }

  useEffect(() => {
    const newTotal = calculateTotal()
    if (newTotal !== bookingData.totalAmount) {
      setBookingData({
        ...bookingData,
        totalAmount: newTotal,
      })
    }
  }, [bookingData.checkIn, bookingData.checkOut, bookingData.accommodation, bookingData.package])

  const nights = calculateNights()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Select Dates & Guests</h2>
        <p className="text-gray-600">Choose your check-in and check-out dates</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Date Selection */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Dates</h3>

            <div className="space-y-4">
              {/* Check-in Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Check-in Date</label>
                <Popover open={checkInOpen} onOpenChange={setCheckInOpen}>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start text-left font-normal bg-transparent"
                      type="button"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {bookingData.checkIn ? format(bookingData.checkIn, "PPP") : "Select check-in date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent 
                    className="w-auto p-0 bg-white shadow-xl rounded-lg overflow-hidden border border-gray-200"
                    align="start"
                    sideOffset={5}
                    collisionPadding={10}
                  >
                    <Calendar
                      mode="single"
                      selected={bookingData.checkIn || undefined}
                      onSelect={(date) => {
                        updateCheckIn(date)
                      }}
                      disabled={(date) => date < new Date()}
                      initialFocus
                      defaultMonth={bookingData.checkIn || new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Check-out Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Check-out Date</label>
                <Popover open={checkOutOpen} onOpenChange={setCheckOutOpen}>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start text-left font-normal bg-transparent"
                      type="button"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {bookingData.checkOut ? format(bookingData.checkOut, "PPP") : "Select check-out date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent 
                    className="w-auto p-0 bg-white shadow-xl rounded-lg overflow-hidden border border-gray-200"
                    align="start"
                    sideOffset={5}
                    collisionPadding={10}
                  >
                    <Calendar
                      mode="single"
                      selected={bookingData.checkOut || undefined}
                      onSelect={(date) => {
                        updateCheckOut(date)
                      }}
                      disabled={(date) => !bookingData.checkIn || date <= bookingData.checkIn}
                      initialFocus
                      defaultMonth={bookingData.checkIn || new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {nights > 0 && (
                <div className="p-3 bg-emerald-50 rounded-lg">
                  <div className="text-sm text-emerald-700">
                    <strong>{nights}</strong> night{nights > 1 ? "s" : ""} selected
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Guest Selection */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Number of Guests</h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-emerald-600" />
                  <div>
                    <div className="font-medium text-gray-900">Guests</div>
                    <div className="text-sm text-gray-500">
                      Maximum {bookingData.accommodation?.capacity || "N/A"} guests
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => updateGuests(-1)}
                    disabled={bookingData.guests <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-8 text-center font-medium">{bookingData.guests}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => updateGuests(1)}
                    disabled={bookingData.guests >= (bookingData.accommodation?.capacity || 10)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {bookingData.accommodation && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600">
                    Selected: <strong>{bookingData.accommodation.name}</strong>
                  </div>
                  <div className="text-sm text-gray-600">
                    Capacity: Up to {bookingData.accommodation.capacity} guests
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
