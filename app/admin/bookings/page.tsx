import { BookingManagement } from "@/components/admin/booking-management"
import { AdminLayout } from "@/components/admin/admin-layout"

export default function AdminBookingsPage() {
  return (
    <AdminLayout>
      <BookingManagement />
    </AdminLayout>
  )
}
