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

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from("bookings")
          .select(`
            *,
            accommodations (name, type, price_per_night),
            packages (name, price)
          `)
          .eq("id", params.id)
          .single()

        if (error || !data) {
          throw error || new Error('Booking not found')
        }

        setBooking(data as Booking)
        setFormData({
          guest_name: data.guest_name,
          guest_email: data.guest_email,
          guest_phone: data.guest_phone,
          check_in_date: data.check_in_date,
          check_out_date: data.check_out_date,
          guests: data.guests,
          status: data.status,
          special_requests: data.special_requests || ''
        })
      } catch (error) {
        console.error('Error fetching booking:', error)
        toast({
          title: 'Error',
          description: 'Failed to load booking details',
          variant: 'destructive',
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
      const response = await fetch(`/api/admin/bookings/${params.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to update booking')
      }

      const data = await response.json()
      setBooking(data)
      
      toast({
        title: 'Success',
        description: 'Booking updated successfully',
      })
      
      router.push(`/admin/bookings/${params.id}`)
    } catch (error) {
      console.error('Error updating booking:', error)
      toast({
        title: 'Error',
        description: 'Failed to update booking',
        variant: 'destructive',
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
                <Label htmlFor="guests">Number of Guests</Label>
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
