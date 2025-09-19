import { AdminLayout } from "@/components/admin/admin-layout"

export default function FinancialPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Financial Overview</h1>
          <p className="text-gray-600">View and manage resort finances</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Revenue Card */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900">Total Revenue</h3>
            <p className="text-3xl font-bold text-emerald-600">₹0</p>
            <p className="text-sm text-gray-500 mt-2">This month</p>
          </div>
          
          {/* Expenses Card */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900">Total Expenses</h3>
            <p className="text-3xl font-bold text-red-600">₹0</p>
            <p className="text-sm text-gray-500 mt-2">This month</p>
          </div>
          
          {/* Profit Card */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900">Net Profit</h3>
            <p className="text-3xl font-bold text-blue-600">₹0</p>
            <p className="text-sm text-gray-500 mt-2">This month</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Transactions</h3>
          <div className="text-center py-8 text-gray-500">
            No recent transactions
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
