import { BookingFlow } from "@/components/booking/booking-flow"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"

export default function BookingPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="pt-16">
        <BookingFlow />
      </div>
      <Footer />
    </main>
  )
}
