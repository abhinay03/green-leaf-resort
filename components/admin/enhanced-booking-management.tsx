"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Eye, Edit, CheckCircle, XCircle, Clock, Plus, DollarSign } from "lucide-react"
import { updateBookingStatus } from "@/api/admin/bookings" // Import updateBookingStatus

export function EnhancedBookingManagement() {
  const [bookings, setBookings] = useState([])
  const [accommodations, setAccommodations] = useState([])
  const [packages, setPackages] = useState([])
  const [menuItems, setMenuItems] = useState([])
  const [filteredBookings, setFilteredBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [showNewBooking, setShowNewBooking] = useState(false)
  const [showExtras, setShowExtras] = useState(false)
  const [showCustomAmount, setShowCustomAmount] = useState(false)

  // New booking form state
  const [newBooking, setNewBooking] = useState({
    accommodation_id: "",
    package_id: "",
    check_in_date: "",
    check_out_date: "",
    guests: 2,
    guest_name: "",
    guest_email: "",
    guest_phone: "",
    special_requests: "",
    custom_amount: "",
    notes: "",
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [bookingsRes, accommodationsRes, packagesRes, menuRes] = await Promise.all([
        fetch("/api/admin/bookings"),
        fetch("/api/accommodations"),
        fetch("/api/packages"),
        fetch("/api/admin/menu-items"),
      ])

      const [bookingsData, accommodationsData, packagesData, menuData] = await Promise.all([
        bookingsRes.json(),
        accommodationsRes.json(),
        packagesRes.json(),
        menuRes.json(),
      ])

      setBookings(bookingsData)
      setAccommodations(accommodationsData)
      setPackages(packagesData)
      setMenuItems(menuData)
      setFilteredBookings(bookingsData)
    } catch (error) {
      console.error("Failed to fetch data:", error)
    } finally {
      setLoading(false)
    }
  }

  const createBooking = async () => {
    try {
      const accommodation = accommodations.find((a) => a.id === newBooking.accommodation_id)
      const packageItem = packages.find((p) => p.id === newBooking.package_id)

      const checkIn = new Date(newBooking.check_in_date)
      const checkOut = new Date(newBooking.check_out_date)
      const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))

      let totalAmount = accommodation.price_per_night * nights
      if (packageItem) totalAmount += packageItem.price
      if (newBooking.custom_amount) totalAmount = Number.parseFloat(newBooking.custom_amount)

      const response = await fetch("/api/admin/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newBooking,
          total_amount: totalAmount,
          status: "confirmed",
        }),
      })

      if (response.ok) {
        setShowNewBooking(false)
        setNewBooking({
          accommodation_id: "",
          package_id: "",
          check_in_date: "",
          check_out_date: "",
          guests: 2,
          guest_name: "",
          guest_email: "",
          guest_phone: "",
          special_requests: "",
          custom_amount: "",
          notes: "",
        })
        fetchData()
      }
    } catch (error) {
      console.error("Failed to create booking:", error)
    }
  }

  const addExtraToBooking = async (bookingId: string, menuItemId: string, quantity: number) => {
    try {
      const response = await fetch("/api/admin/booking-extras", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          booking_id: bookingId,
          menu_item_id: menuItemId,
          quantity,
        }),
      })

      if (response.ok) {
        fetchData()
      }
    } catch (error) {
      console.error("Failed to add extra:", error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Enhanced Booking Management</h1>
          <p className="text-gray-600">Manage bookings, extras, and custom pricing</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showNewBooking} onOpenChange={setShowNewBooking}>
            <DialogTrigger asChild>
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="h-4 w-4 mr-2" />
                New Booking
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Booking</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-4">
                <div>
                  <Label>Guest Name</Label>
                  <Input
                    value={newBooking.guest_name}
                    onChange={(e) => setNewBooking({ ...newBooking, guest_name: e.target.value })}
                    placeholder="Enter guest name"
                  />
                </div>
                <div>
                  <Label>Guest Email</Label>
                  <Input
                    type="email"
                    value={newBooking.guest_email}
                    onChange={(e) => setNewBooking({ ...newBooking, guest_email: e.target.value })}
                    placeholder="Enter email"
                  />
                </div>
                <div>
                  <Label>Guest Phone</Label>
                  <Input
                    value={newBooking.guest_phone}
                    onChange={(e) => setNewBooking({ ...newBooking, guest_phone: e.target.value })}
                    placeholder="Enter phone number"
                  />
                </div>
                <div>
                  <Label>Number of Guests</Label>
                  <Input
                    type="number"
                    min="1"
                    value={newBooking.guests}
                    onChange={(e) => setNewBooking({ ...newBooking, guests: Number.parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>Accommodation</Label>
                  <Select
                    value={newBooking.accommodation_id || "default"}
                    onValueChange={(value) => setNewBooking({ ...newBooking, accommodation_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select accommodation" />
                    </SelectTrigger>
                    <SelectContent>
                      {accommodations.map((acc: any) => (
                        <SelectItem key={acc.id} value={acc.id}>
                          {acc.name} - ₹{acc.price_per_night}/night
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Package (Optional)</Label>
                  <Select
                    value={newBooking.package_id || "default"}
                    onValueChange={(value) => setNewBooking({ ...newBooking, package_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select package" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No Package</SelectItem>
                      {packages.map((pkg: any) => (
                        <SelectItem key={pkg.id} value={pkg.id}>
                          {pkg.name} - ₹{pkg.price}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Check-in Date</Label>
                  <Input
                    type="date"
                    value={newBooking.check_in_date}
                    onChange={(e) => setNewBooking({ ...newBooking, check_in_date: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Check-out Date</Label>
                  <Input
                    type="date"
                    value={newBooking.check_out_date}
                    onChange={(e) => setNewBooking({ ...newBooking, check_out_date: e.target.value })}
                  />
                </div>
                <div className="col-span-2">
                  <Label>Custom Amount (Optional)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={newBooking.custom_amount}
                    onChange={(e) => setNewBooking({ ...newBooking, custom_amount: e.target.value })}
                    placeholder="Override calculated amount"
                  />
                </div>
                <div className="col-span-2">
                  <Label>Special Requests</Label>
                  <Textarea
                    value={newBooking.special_requests}
                    onChange={(e) => setNewBooking({ ...newBooking, special_requests: e.target.value })}
                    placeholder="Any special requests or notes"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowNewBooking(false)}>
                  Cancel
                </Button>
                <Button onClick={createBooking} className="bg-emerald-600 hover:bg-emerald-700">
                  Create Booking
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* ... existing filters and table code ... */}

      {/* Enhanced table with extra actions */}
      <Card>
        <CardHeader>
          <CardTitle>All Bookings ({filteredBookings.length})</CardTitle>
        </CardHeader>
        <CardContent>
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
              {filteredBookings.map((booking: any) => (
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
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Booking
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedBooking(booking)
                            setShowExtras(true)
                          }}
                        >
                          <DollarSign className="mr-2 h-4 w-4" />
                          Add Extras
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedBooking(booking)
                            setShowCustomAmount(true)
                          }}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Custom Amount
                        </DropdownMenuItem>
                        {booking.status === "pending" && (
                          <DropdownMenuItem onClick={() => updateBookingStatus(booking.id, "confirmed")}>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Confirm
                          </DropdownMenuItem>
                        )}
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

// Helper functions
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
