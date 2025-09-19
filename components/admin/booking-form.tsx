"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

export function BookingForm() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [guests, setGuests] = useState(1)
  
  return (
    <form className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="guestName">Guest Name</Label>
          <Input id="guestName" placeholder="Enter guest name" />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="Enter email" />
        </div>
        
        <div className="space-y-2">
          <Label>Check-in Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="guests">Number of Guests</Label>
          <Input 
            id="guests" 
            type="number" 
            min="1"
            value={guests}
            onChange={(e) => setGuests(parseInt(e.target.value) || 1)}
          />
        </div>
      </div>
      
      <div className="flex justify-end space-x-4 pt-4">
        <Button variant="outline" type="button">
          Cancel
        </Button>
        <Button type="submit">Create Booking</Button>
      </div>
    </form>
  )
}
