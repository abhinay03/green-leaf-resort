import { AdminDashboard } from "@/components/admin/admin-dashboard"
import { AdminLayout } from "@/components/admin/admin-layout"
import { Metadata } from "next"

// This is a dynamic page that requires authentication
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  description: 'Administrative dashboard for managing the resort',
  // Viewport settings should be in layout.tsx, not here
}

export default function AdminDashboardPage() {
  return (
    <AdminLayout>
      <AdminDashboard />
    </AdminLayout>
  )
}
