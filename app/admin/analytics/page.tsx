import { AdminLayout } from "@/components/admin/admin-layout"

export default function AnalyticsPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600">View resort performance and insights</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Overview Card */}
          <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue Overview</h3>
            <div className="h-64 bg-gray-100 rounded flex items-center justify-center text-gray-400">
              Revenue Chart Placeholder
            </div>
          </div>
          
          {/* Key Metrics */}
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Occupancy Rate</h3>
              <div className="flex items-center justify-center">
                <div className="w-32 h-32 rounded-full border-8 border-emerald-100 flex items-center justify-center">
                  <span className="text-2xl font-bold">0%</span>
                </div>
              </div>
              <p className="text-center text-sm text-gray-500 mt-2">Current Month</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Top Performing</h3>
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-gray-600">Most Booked Package</p>
                  <p className="font-medium">-</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Popular Room Type</p>
                  <p className="font-medium">-</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Guest Demographics */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Guest Demographics</h3>
            <div className="h-64 bg-gray-100 rounded flex items-center justify-center text-gray-400">
              Demographics Chart Placeholder
            </div>
          </div>
          
          {/* Booking Sources */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Booking Sources</h3>
            <div className="h-64 bg-gray-100 rounded flex items-center justify-center text-gray-400">
              Booking Sources Chart Placeholder
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
