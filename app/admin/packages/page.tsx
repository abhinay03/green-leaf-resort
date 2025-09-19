import { PackageManager } from "@/components/admin/package-manager"
import { AdminLayout } from "@/components/admin/admin-layout"

export default function PackagesPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Packages</h1>
          <p className="text-muted-foreground">
            Manage your resort packages and pricing
          </p>
        </div>
        <PackageManager />
      </div>
    </AdminLayout>
  )
}
