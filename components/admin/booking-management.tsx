"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { Search, Filter, MoreHorizontal, Eye, Edit, CheckCircle, XCircle, Clock } from "lucide-react"

interface Accommodation {
  id: string
  name: string
  type: string
  price_per_night: number
}

interface Package {
  id: string
  name: string
  price: number
}

interface Booking {
  id: string
  guest_name: string
  guest_email: string
  guest_phone: string
  check_in_date: string
  check_out_date: string
  guests: number
  total_amount: number
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  accommodations?: Accommodation
  packages?: Package
}

export function BookingManagement() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    fetchBookings()
  }, [])

  useEffect(() => {
    filterBookings()
  }, [bookings, searchTerm, statusFilter])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/bookings", {
        cache: 'no-store', // Ensure fresh data
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch bookings')
      }
      
      const data: Booking[] = await response.json()
      setBookings(data)
      
      // Show success toast only if there was a previous error
      if (bookings.length === 0) {
        toast({
          title: 'Bookings loaded',
          description: `Found ${data.length} bookings`,
          variant: 'default',
        })
      }
    } catch (error) {
      console.error("Failed to fetch bookings:", error)
      
      toast({
        title: 'Error',
        description: 'Failed to load bookings. Please refresh the page to try again.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const updateBookingStatus = async (id: string, status: 'pending' | 'confirmed' | 'completed' | 'cancelled') => {
    try {
      setIsUpdating(id)
      
      // Show loading toast
      const loadingToast = toast({
        title: 'Updating...',
        description: `Setting booking status to ${status}`,
        variant: 'default',
      })
      
      const response = await fetch(`/api/admin/bookings/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status })
      })

      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to update booking status')
      }
      
      // Update the local state with the full booking data from the server
      setBookings(bookings.map(booking => 
        booking.id === id ? { ...booking, ...result } : booking
      ))
      
      // Dismiss loading toast and show success
      loadingToast.dismiss()
      toast({
        title: 'Success',
        description: `Booking has been ${status} successfully.`,
        variant: 'default',
      })
    } catch (error) {
      console.error('Error updating booking:', error)
      
      // Dismiss any existing loading toasts
      // No need to explicitly dismiss as the toast will auto-dismiss
      
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update booking. Please try again.',
        variant: 'destructive',
        duration: 5000,
      })
    } finally {
      setIsUpdating(null)
    }
  }

  const handleDeleteBooking = async (id: string) => {
    // Use a more modern confirmation dialog
    const confirmed = window.confirm(
      '⚠️ Are you sure you want to delete this booking?\n\n' +
      'This action is permanent and cannot be undone.\n' +
      'The booking will be removed from the system.'
    )
    
    if (!confirmed) return
    
    try {
      setIsUpdating(id)
      
      // Show loading toast
      const loadingToast = toast({
        title: 'Deleting...',
        description: 'Please wait while we delete the booking.',
        variant: 'default',
        duration: 5000,
      })
      
      const response = await fetch(`/api/admin/bookings/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete booking')
      }
      
      // Update local state
      setBookings(bookings.filter(booking => booking.id !== id))
      
      // Dismiss loading toast and show success
      loadingToast.dismiss()
      toast({
        title: 'Success',
        description: 'Booking has been deleted successfully.',
        variant: 'default',
      })
    } catch (error) {
      console.error('Error deleting booking:', error)
      
      // Dismiss any existing loading toasts
      // No need to explicitly dismiss as the toast will auto-dismiss
      
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete booking. Please try again.',
        variant: 'destructive',
        duration: 5000,
      })
    } finally {
      setIsUpdating(null)
    }
  }

  const filterBookings = () => {
    let filtered = bookings

    if (searchTerm) {
      filtered = filtered.filter(
        (booking) =>
          booking.guest_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          booking.guest_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          booking.guest_phone?.includes(searchTerm)
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((booking) => booking.status === statusFilter)
    }

    setFilteredBookings(filtered)
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
        return <Clock className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="bg-gray-200 h-8 rounded mb-4"></div>
          <div className="bg-gray-200 h-64 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Booking Management</h1>
          <p className="text-gray-600">Manage all resort bookings and reservations</p>
        </div>
        <Button onClick={() => router.push('/admin/bookings/new')}>
          New Booking
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search bookings..."
                className="pl-10 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                  <Filter className="h-4 w-4" />
                  Status: {statusFilter === "all" ? "All" : statusFilter}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setStatusFilter("all")}>All Statuses</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("pending")}>Pending</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("confirmed")}>Confirmed</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("completed")}>Completed</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("cancelled")}>Cancelled</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Guest</TableHead>
                <TableHead>Accommodation</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Guests</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{booking.guest_name}</div>
                      <div className="text-sm text-gray-500">{booking.guest_email}</div>
                      <div className="text-sm text-gray-500">{booking.guest_phone}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{booking.accommodations?.name}</div>
                      <div className="text-sm text-gray-500">{booking.accommodations?.type}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>Check-in: {new Date(booking.check_in_date).toLocaleDateString()}</div>
                      <div>Check-out: {new Date(booking.check_out_date).toLocaleDateString()}</div>
                    </div>
                  </TableCell>
                  <TableCell>{booking.guests}</TableCell>
                  <TableCell className="font-medium">₹{booking.total_amount}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(booking.status)}>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(booking.status)}
                        {booking.status}
                      </div>
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild disabled={!!isUpdating}>
                        <Button variant="ghost" size="icon" disabled={!!isUpdating}>
                          {isUpdating === booking.id ? (
                            <div className="h-4 w-4 border-2 border-gray-400 border-t-gray-600 rounded-full animate-spin" />
                          ) : (
                            <MoreHorizontal className="h-4 w-4" />
                          )}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => router.push(`/admin/bookings/${booking.id}`)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push(`/admin/bookings/${booking.id}/edit`)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Booking
                        </DropdownMenuItem>
                        {booking.status === "pending" && (
                          <DropdownMenuItem 
                            onClick={() => updateBookingStatus(booking.id, "confirmed")}
                            disabled={!!isUpdating}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Confirm
                          </DropdownMenuItem>
                        )}
                        {booking.status === "confirmed" && (
                          <DropdownMenuItem 
                            onClick={() => updateBookingStatus(booking.id, "completed")}
                            disabled={!!isUpdating}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Complete
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() => updateBookingStatus(booking.id, "cancelled")}
                          className="text-red-600"
                          disabled={!!isUpdating}
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Cancel
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeleteBooking(booking.id)}
                          className="text-red-600"
                          disabled={!!isUpdating}
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
