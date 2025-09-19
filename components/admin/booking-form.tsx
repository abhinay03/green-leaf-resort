"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { format, addDays } from "date-fns"
import { Calendar as CalendarIcon, Loader2 } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"

interface Accommodation {
  id: string
  name: string
  price_per_night: number
}

export function BookingForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [accommodations, setAccommodations] = useState<Accommodation[]>([])
  const [packages, setPackages] = useState<Array<{id: string, name: string, price: number}>>([])
  
  // Form state
  const [formData, setFormData] = useState({
    guestName: '',
    email: '',
    phone: '',
    checkInDate: new Date(),
    checkOutDate: addDays(new Date(), 1),
    guests: 1,
    accommodationId: '',
    packageId: 'no-package', // Special value for no package selected
    specialRequests: ''
  })

  // Fetch accommodations and packages on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [accRes, pkgRes] = await Promise.all([
          fetch('/api/accommodations'),
          fetch('/api/packages')
        ])
        
        if (accRes.ok) {
          const accData = await accRes.json()
          setAccommodations(accData)
          if (accData.length > 0) {
            setFormData(prev => ({ ...prev, accommodationId: accData[0].id }))
          }
        }
        
        if (pkgRes.ok) {
          const pkgData = await pkgRes.json()
          setPackages(pkgData)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }
    
    fetchData()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setFormData(prev => ({ ...prev, [id]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      const selectedAccommodation = accommodations.find(a => a.id === formData.accommodationId)
      const selectedPackage = packages.find(p => p.id === formData.packageId)
      
      const bookingData = {
        guest_name: formData.guestName,
        guest_email: formData.email,
        guest_phone: formData.phone,
        check_in_date: format(formData.checkInDate, 'yyyy-MM-dd'),
        check_out_date: format(formData.checkOutDate, 'yyyy-MM-dd'),
        guests: formData.guests,
        accommodation_id: formData.accommodationId,
        package_id: formData.packageId === 'no-package' ? null : formData.packageId,
        special_requests: formData.specialRequests,
        total_amount: calculateTotal()
      }
      
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData)
      })
      
      if (response.ok) {
        const data = await response.json()
        toast({
          title: 'Booking Created',
          description: `Booking #${data.booking_id} has been created successfully.`,
        })
        router.push('/admin/bookings')
      } else {
        throw new Error('Failed to create booking')
      }
    } catch (error) {
      console.error('Error creating booking:', error)
      toast({
        title: 'Error',
        description: 'Failed to create booking. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  const calculateTotal = (): number => {
    const accommodation = accommodations.find(a => a.id === formData.accommodationId)
    const pkg = formData.packageId !== 'no-package' 
      ? packages.find(p => p.id === formData.packageId)
      : null
    
    let total = 0
    
    // Add accommodation cost (price per person per night)
    if (accommodation) {
      const nights = Math.ceil((formData.checkOutDate.getTime() - formData.checkInDate.getTime()) / (1000 * 60 * 60 * 24))
      total += accommodation.price_per_night * nights * formData.guests
    }
    
    // Add package cost if selected and valid (package price is per person)
    if (pkg && formData.packageId !== 'no-package') {
      total += pkg.price * formData.guests
    }
    
    return Math.round(total) // Round to nearest integer
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="guestName">Guest Name *</Label>
          <Input 
            id="guestName" 
            placeholder="Enter guest name" 
            value={formData.guestName}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input 
            id="email" 
            type="email" 
            placeholder="Enter email" 
            value={formData.email}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="phone">Phone *</Label>
          <Input 
            id="phone" 
            type="tel" 
            placeholder="Enter phone number" 
            value={formData.phone}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label>Accommodation *</Label>
          <Select 
            value={formData.accommodationId} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, accommodationId: value }))}
          >
            <SelectTrigger className="bg-white hover:bg-gray-50 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2">
              <SelectValue placeholder="Select accommodation" className="text-gray-900" />
            </SelectTrigger>
            <SelectContent className="bg-white border border-gray-200 rounded-md shadow-lg">
              {accommodations.map(acc => (
                <SelectItem key={acc.id} value={acc.id}>
                  {acc.name} (₹{acc.price_per_night}/night)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label>Package (Optional)</Label>
          <Select 
            value={formData.packageId}
            onValueChange={(value) => setFormData(prev => ({ ...prev, packageId: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a package" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="no-package">No package</SelectItem>
              {packages.map(pkg => (
                <SelectItem key={pkg.id} value={pkg.id}>
                  {pkg.name} (₹{pkg.price.toLocaleString()} per person)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label>Check-in Date *</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !formData.checkInDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.checkInDate ? format(formData.checkInDate, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={formData.checkInDate}
                onSelect={(date) => date && setFormData(prev => ({ ...prev, checkInDate: date }))}
                initialFocus
                disabled={(date) => date < new Date()}
              />
            </PopoverContent>
          </Popover>
        </div>
        
        <div className="space-y-2">
          <Label>Check-out Date *</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !formData.checkOutDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.checkOutDate ? format(formData.checkOutDate, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={formData.checkOutDate}
                onSelect={(date) => date && setFormData(prev => ({ ...prev, checkOutDate: date }))}
                initialFocus
                disabled={(date) => date <= formData.checkInDate}
              />
            </PopoverContent>
          </Popover>
        </div>
        
        <div className="space-y-2">
          <Label>Guests *</Label>
          <Input 
            type="number" 
            min="1" 
            value={formData.guests} 
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              guests: Math.max(1, parseInt(e.target.value) || 1) 
            }))} 
            required 
          />
        </div>
        
        <div className="space-y-2">
          <Label>Total Amount</Label>
          <div className="p-2 border rounded-md bg-gray-50">
            <div className="font-medium text-lg">
              ₹{calculateTotal().toLocaleString()}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              {formData.guests} guest{formData.guests !== 1 ? 's' : ''} × 
              {formData.accommodationId ? (
                <>
                  ₹{accommodations.find(a => a.id === formData.accommodationId)?.price_per_night?.toLocaleString() || 0} per night
                </>
              ) : 'Select accommodation'}
              {formData.packageId && formData.packageId !== 'no-package' && (
                <>
                  <br />+ {formData.guests} × ₹{packages.find(p => p.id === formData.packageId)?.price?.toLocaleString() || 0} package
                </>
              )}
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            {accommodations.find(a => a.id === formData.accommodationId) && (
              <>
                {Math.ceil((formData.checkOutDate.getTime() - formData.checkInDate.getTime()) / (1000 * 60 * 60 * 24))} night(s) × 
                ₹{accommodations.find(a => a.id === formData.accommodationId)?.price_per_night}
                {formData.packageId && (
                  <>
                    <br />+ {packages.find(p => p.id === formData.packageId)?.name} package
                  </>
                )}
              </>
            )}
          </p>
        </div>
        
        <div className="md:col-span-2 space-y-2">
          <Label htmlFor="specialRequests">Special Requests</Label>
          <Textarea 
            id="specialRequests" 
            placeholder="Any special requests or notes?"
            value={formData.specialRequests}
            onChange={handleInputChange}
            rows={3}
          />
        </div>
      </div>
      
      <div className="flex justify-end space-x-4 pt-4 border-t">
        <Button 
          variant="outline" 
          type="button"
          onClick={() => router.push('/admin/bookings')}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : 'Create Booking'}
        </Button>
      </div>
    </form>
  )
}
