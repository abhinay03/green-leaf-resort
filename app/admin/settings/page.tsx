import { AdminLayout } from "@/components/admin/admin-layout"

export default function SettingsPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">Manage your resort settings and preferences</p>
        </div>
        
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6">
            <div className="space-y-8">
              {/* General Settings */}
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">General Settings</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Resort Name</h3>
                      <p className="text-sm text-gray-500">The name of your resort</p>
                    </div>
                    <input
                      type="text"
                      defaultValue="The Green Leaf Resorts"
                      className="w-64 px-3 py-2 border rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Timezone</h3>
                      <p className="text-sm text-gray-500">Your resort's timezone</p>
                    </div>
                    <select className="w-64 px-3 py-2 border rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500">
                      <option>Asia/Kolkata (IST, UTC+5:30)</option>
                      <option>UTC</option>
                      <option>America/New_York (EST, UTC-5)</option>
                      <option>Europe/London (GMT, UTC+0)</option>
                    </select>
                  </div>
                </div>
              </div>
              
              {/* Email Notifications */}
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Email Notifications</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">New Booking Notifications</h3>
                      <p className="text-sm text-gray-500">Receive email for new bookings</p>
                    </div>
                    <label className="inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Cancellation Notifications</h3>
                      <p className="text-sm text-gray-500">Receive email for booking cancellations</p>
                    </div>
                    <label className="inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>
                </div>
              </div>
              
              {/* Save Button */}
              <div className="pt-4 border-t border-gray-200">
                <button
                  type="button"
                  className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-md shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
