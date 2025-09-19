"use client"

import { useState } from "react"
import { AccommodationSelection } from "./accommodation-selection"
import { DateGuestSelection } from "./date-guest-selection"
import { PackageSelection } from "./package-selection"
import { GuestDetails } from "./guest-details"
import { BookingConfirmation } from "./booking-confirmation"
import { BookingSummary } from "./booking-summary"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

export interface BookingData {
  accommodation: any
  checkIn: Date | null
  checkOut: Date | null
  guests: number
  package: any
  guestDetails: {
    firstName: string
    lastName: string
    email: string
    phone: string
    specialRequests: string
  }
  totalAmount: number
}

export function BookingFlow() {
  const [currentStep, setCurrentStep] = useState(1)
  const [bookingData, setBookingData] = useState<BookingData>({
    accommodation: null,
    checkIn: null,
    checkOut: null,
    guests: 2,
    package: null,
    guestDetails: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      specialRequests: "",
    },
    totalAmount: 0,
  })

  const steps = [
    { number: 1, title: "Choose Accommodation", component: AccommodationSelection },
    { number: 2, title: "Select Dates & Guests", component: DateGuestSelection },
    { number: 3, title: "Add Package (Optional)", component: PackageSelection },
    { number: 4, title: "Guest Details", component: GuestDetails },
    { number: 5, title: "Confirmation", component: BookingConfirmation },
  ]

  const CurrentStepComponent = steps[currentStep - 1].component

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return bookingData.accommodation !== null
      case 2:
        return bookingData.checkIn && bookingData.checkOut && bookingData.guests > 0
      case 3:
        return true // Package is optional
      case 4:
        return (
          bookingData.guestDetails.firstName &&
          bookingData.guestDetails.lastName &&
          bookingData.guestDetails.email &&
          bookingData.guestDetails.phone
        )
      default:
        return false
    }
  }

  const nextStep = () => {
    if (currentStep < steps.length && canProceed()) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Top Navigation Buttons */}
        <div className="flex justify-between mb-6">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="flex items-center gap-2 bg-transparent"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          {currentStep < steps.length && (
            <Button
              onClick={nextStep}
              disabled={!canProceed()}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    currentStep >= step.number ? "bg-emerald-600 text-white" : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {step.number}
                </div>
                <span
                  className={`ml-2 font-medium ${currentStep >= step.number ? "text-emerald-600" : "text-gray-500"}`}
                >
                  {step.title}
                </span>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-1 mx-4 ${currentStep > step.number ? "bg-emerald-600" : "bg-gray-200"}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <CurrentStepComponent 
              bookingData={bookingData} 
              setBookingData={setBookingData} 
              onNext={currentStep === 1 ? nextStep : undefined}
            />

            {/* Bottom Navigation Buttons */}
            {currentStep < 5 && (
              <div className="flex justify-between mt-8">
                <Button
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className="flex items-center gap-2 bg-transparent"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  onClick={nextStep}
                  disabled={!canProceed()}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Booking Summary Sidebar */}
          <div className="lg:col-span-1">
            <BookingSummary bookingData={bookingData} />
          </div>
        </div>
      </div>
    </div>
  )
}
