'use client'

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { format } from "date-fns"
import { ArrowLeft, Calendar, Clock, Mail, Phone, User } from "lucide-react"
import Link from "next/link"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"

interface Booking {
  id: string
  guest_name: string
  guest_email: string
  guest_phone: string
  check_in_date: string
  check_out_date: string
  guests: number
  total_amount: number
  original_amount?: number
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  special_requests?: string
  accommodations?: {
    name: string
    type: string
    price_per_night: number
  }
  packages?: {
    name: string
    price: number
  }
}

export default function EditBookingPage({
  params,
}: {
  params: { id: string }
}) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [booking, setBooking] = useState<Booking | null>(null)
  const [formData, setFormData] = useState<Partial<Booking>>({})
  const [isCustomAmount, setIsCustomAmount] = useState(false)

  // Calculate the number of nights between check-in and check-out
  const calculateNights = (checkIn: string, checkOut: string) => {
    const checkInDate = new Date(checkIn)
    const checkOutDate = new Date(checkOut)
    return Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24))
  }

  // Calculate the total amount based on guests and nights
  const calculateTotalAmount = (guests: number, checkIn: string, checkOut: string) => {
    if (!booking || !booking.accommodations || !booking.packages) return 0
    const nights = calculateNights(checkIn, checkOut)
    const basePrice = booking.accommodations.price_per_night || 0
    const packagePrice = booking.packages.price || 0
    return (basePrice + packagePrice) * nights * guests
  }

  // Update the amount when guests, check-in, or check-out changes
  useEffect(() => {
    if (booking && formData.guests && formData.check_in_date && formData.check_out_date && !isCustomAmount) {
      const calculatedTotal = calculateTotalAmount(
        formData.guests,
        formData.check_in_date,
        formData.check_out_date
      )
      setFormData(prev => ({
        ...prev,
        total_amount: calculatedTotal
      }))
    }
  }, [formData.guests, formData.check_in_date, formData.check_out_date, isCustomAmount, booking])

  useEffect(() => {
    async function fetchBooking() {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('bookings')
          .select(`
            *,
            accommodations (name, type, price_per_night),
            packages (name, price)
          `)
          .eq('id', params.id)
          .single()

        if (error) throw error
        
        setBooking(data)
        setFormData({
          guest_name: data.guest_name,
          guest_email: data.guest_email,
          guest_phone: data.guest_phone,
          check_in_date: data.check_in_date,
          check_out_date: data.check_out_date,
          guests: data.guests,
          status: data.status,
          special_requests: data.special_requests || '',
          total_amount: data.total_amount,
          original_amount: data.original_amount
        })
        
        // Check if this booking has a custom amount
        if (data.original_amount !== null && data.original_amount !== undefined) {
          setIsCustomAmount(true)
        }
      } catch (error) {
        console.error('Error fetching booking:', error)
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load booking details. Please try again.'
        })
      } finally {
        setLoading(false)
      }
    }
    fetchBooking()
  }, [params.id, toast])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'guests' ? parseInt(value, 10) : value
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    
    try {
      // Prepare the data to send
      const updateData = { ...formData }
      
      // If this is a custom amount, include the original amount in the request
      if (isCustomAmount && updateData.total_amount !== undefined) {
        const calculatedAmount = calculateTotalAmount(
          updateData.guests || 0,
          updateData.check_in_date || '',
          updateData.check_out_date || ''
        )
        
        updateData.original_amount = calculatedAmount
      } else {
        // If not using a custom amount, make sure original_amount is cleared
        delete updateData.original_amount
      }
      
      // Send the update request
      const response = await fetch(`/api/admin/bookings/${params.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update booking')
      }
      
      const updatedBooking = await response.json()
      
      toast({
        title: 'Success',
        description: 'Booking updated successfully!',
      })
      
      // Update local state with the returned data
      setBooking(updatedBooking)
      
      // Redirect back to the booking details page
      router.push(`/admin/bookings/${params.id}`)
    } catch (error) {
      console.error('Error updating booking:', error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update booking. Please try again.'
      })
    } finally {
      setSaving(false)
    }
  }

  const formatDateForInput = (dateString: string) => {
    const date = new Date(dateString)
    return date.toISOString().split('T')[0]
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/bookings">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Booking Not Found</h1>
        </div>
        <p className="text-muted-foreground">The requested booking could not be found.</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <form onSubmit={handleSubmit}>
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="icon" asChild>
            <Link href={`/admin/bookings/${params.id}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Edit Booking</h1>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Guest Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="guest_name">Full Name</Label>
                <Input 
                  id="guest_name" 
                  name="guest_name" 
                  value={formData.guest_name || ''}
                  onChange={handleChange}
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="guest_email">Email</Label>
                <Input 
                  id="guest_email" 
                  name="guest_email" 
                  type="email" 
                  value={formData.guest_email || ''}
                  onChange={handleChange}
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="guest_phone">Phone</Label>
                <Input 
                  id="guest_phone" 
                  name="guest_phone" 
                  type="tel" 
                  value={formData.guest_phone || ''}
                  onChange={handleChange}
                  required 
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Booking Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="check_in_date">Check-in Date</Label>
                  <Input 
                    id="check_in_date" 
                    name="check_in_date" 
                    type="date" 
                    value={formData.check_in_date ? formatDateForInput(formData.check_in_date) : ''}
                    onChange={handleChange}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="check_out_date">Check-out Date</Label>
                  <Input 
                    id="check_out_date" 
                    name="check_out_date" 
                    type="date" 
                    value={formData.check_out_date ? formatDateForInput(formData.check_out_date) : ''}
                    onChange={handleChange}
                    required 
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="guests">Number of Guests</Label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="custom-amount"
                      checked={isCustomAmount}
                      onChange={(e) => {
                        setIsCustomAmount(e.target.checked)
                        // If disabling custom amount, recalculate the total
                        if (!e.target.checked) {
                          if (formData.guests && formData.check_in_date && formData.check_out_date) {
                            const calculatedAmount = calculateTotalAmount(
                              formData.guests,
                              formData.check_in_date,
                              formData.check_out_date
                            )
                            setFormData(prev => ({
                              ...prev,
                              total_amount: calculatedAmount
                            }))
                          }
                        }
                      }}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="custom-amount" className="text-sm font-medium text-gray-700">
                      Set custom amount
                    </label>
                  </div>
                </div>
                <Input 
                  id="guests" 
                  name="guests" 
                  type="number" 
                  min="1" 
                  value={formData.guests || ''}
                  onChange={handleChange}
                  required 
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="total_amount">Total Amount</Label>
                  {!isCustomAmount && formData.original_amount && formData.total_amount !== formData.original_amount && (
                    <span className="text-sm text-gray-500">
                      ₹{formData.original_amount.toFixed(2)}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">₹</span>
                  </div>
                  <Input
                    id="total_amount"
                    type="number"
                    value={formData.total_amount || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        total_amount: parseFloat(e.target.value) || 0,
                      })
                    }
                    min="0"
                    step="0.01"
                    className={`pl-7 ${!isCustomAmount ? 'bg-gray-100' : ''}`}
                    disabled={!isCustomAmount}
                  />
                </div>
                {isCustomAmount && formData.original_amount && (
                  <p className="text-xs text-gray-500 mt-1">
                    Original amount: ₹{formData.original_amount.toFixed(2)}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value) => handleSelectChange('status', value as Booking['status'])}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="special_requests">Special Requests</Label>
                <Textarea 
                  id="special_requests" 
                  name="special_requests" 
                  value={formData.special_requests || ''}
                  onChange={handleChange}
                  rows={3} 
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" asChild>
              <Link href={`/admin/bookings/${params.id}`}>
                Cancel
              </Link>
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
