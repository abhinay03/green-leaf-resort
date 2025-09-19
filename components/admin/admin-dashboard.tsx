"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Users, Home, TrendingUp, Clock, CheckCircle, XCircle, AlertCircle, Plus, Check, Bed, BarChart } from "lucide-react"

export function AdminDashboard() {
  const [stats, setStats] = useState({
    totalBookings: 0,
    todayCheckIns: 0,
    todayCheckOuts: 0,
    occupancyRate: 0,
    revenue: 0,
    pendingBookings: 0,
  })
  const [recentBookings, setRecentBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const handleQuickAction = (action: string) => {
    switch(action) {
      case 'new-booking':
        router.push('/admin/bookings')
        break
      case 'check-in':
        router.push('/admin/bookings')
        break
      case 'room-status':
        router.push('/admin/accommodations')
        break
      case 'reports':
        router.push('/admin/analytics')
        break
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Fetch dashboard statistics
      const [bookingsRes, statsRes] = await Promise.all([fetch("/api/admin/bookings"), fetch("/api/admin/stats")])

      const bookings = await bookingsRes.json()
      const dashboardStats = await statsRes.json()

      setRecentBookings(bookings.slice(0, 5))
      setStats(dashboardStats)
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      case "completed":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="h-4 w-4" />
      case "pending":
        return <Clock className="h-4 w-4" />
      case "cancelled":
        return <XCircle className="h-4 w-4" />
      case "completed":
        return <CheckCircle className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 h-32 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome to The Green Leaf Resorts admin panel</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalBookings}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Today's Check-ins</p>
                <p className="text-3xl font-bold text-gray-900">{stats.todayCheckIns}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Occupancy Rate</p>
                <p className="text-3xl font-bold text-gray-900">{stats.occupancyRate}%</p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                <Home className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                <p className="text-3xl font-bold text-gray-900">₹{stats.revenue.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Bookings */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentBookings.map((booking: any) => (
                <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{booking.guest_name}</span>
                      <Badge className={getStatusColor(booking.status)}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(booking.status)}
                          {booking.status}
                        </div>
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      {booking.accommodations?.name} • {booking.guests} guest{booking.guests > 1 ? "s" : ""}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(booking.check_in_date).toLocaleDateString()} -{" "}
                      {new Date(booking.check_out_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-emerald-600">₹{booking.total_amount}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                className="h-full p-4 text-left flex flex-col items-start hover:bg-gray-50 transition-colors"
                onClick={() => router.push('/admin/bookings')}
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-50 mb-2">
                  <Plus className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="font-medium text-base">View Bookings</h3>
                <p className="text-sm text-gray-600 mt-1">Manage all reservations</p>
              </Button>

              <Button 
                variant="outline" 
                className="h-full p-4 text-left flex flex-col items-start hover:bg-gray-50 transition-colors"
                onClick={() => router.push('/admin/guests')}
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-50 mb-2">
                  <Users className="h-5 w-5 text-green-600" />
                </div>
                <h3 className="font-medium text-base">Manage Guests</h3>
                <p className="text-sm text-gray-600 mt-1">View and edit guest information</p>
              </Button>

              <Button 
                variant="outline" 
                className="h-full p-4 text-left flex flex-col items-start hover:bg-gray-50 transition-colors"
                onClick={() => router.push('/admin/accommodations')}
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-50 mb-2">
                  <Home className="h-5 w-5 text-emerald-600" />
                </div>
                <h3 className="font-medium text-base">Accommodations</h3>
                <p className="text-sm text-gray-600 mt-1">Manage rooms and availability</p>
              </Button>

              <Button 
                variant="outline" 
                className="h-full p-4 text-left flex flex-col items-start hover:bg-gray-50 transition-colors"
                onClick={() => router.push('/admin/analytics')}
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-50 mb-2">
                  <BarChart className="h-5 w-5 text-purple-600" />
                </div>
                <h3 className="font-medium text-base">Analytics</h3>
                <p className="text-sm text-gray-600 mt-1">View reports and insights</p>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
