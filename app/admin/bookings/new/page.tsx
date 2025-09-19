import { BookingForm } from "@/components/admin/booking-form"

export default function NewBookingPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">New Booking</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <BookingForm />
      </div>
    </div>
  )
}
