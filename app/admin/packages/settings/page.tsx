import { AdminLayout } from "@/components/admin/admin-layout"
import { PackageSettings } from "@/components/admin/package-settings"

export default function PackageSettingsPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Package Settings</h1>
          <p className="text-muted-foreground">
            Manage package categories and amenities
          </p>
        </div>
        <PackageSettings />
      </div>
    </AdminLayout>
  )
}
