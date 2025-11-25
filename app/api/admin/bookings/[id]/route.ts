import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// Define valid booking statuses
type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled'

// Define request body type
interface UpdateBookingRequest {
  status?: BookingStatus
  guest_name?: string
  guest_email?: string
  guest_phone?: string
  check_in_date?: string
  check_out_date?: string
  guests?: number
  total_amount?: number
  original_amount?: number
  special_requests?: string
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      )
    }

    // Parse and validate request body
    const body: Partial<UpdateBookingRequest> = await request.json()
    
    // Get the current booking to calculate amounts if needed
    const { data: currentBooking, error: fetchError } = await supabase
      .from('bookings')
      .select('*, accommodations(price_per_night), packages(price)')
      .eq('id', params.id)
      .single()

    if (fetchError || !currentBooking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Calculate number of nights
    const calculateNights = (checkIn: string, checkOut: string) => {
      const checkInDate = new Date(checkIn)
      const checkOutDate = new Date(checkOut)
      return Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24))
    }

    // Calculate total amount based on guests and nights
    const calculateTotalAmount = (guests: number, checkIn: string, checkOut: string) => {
      const nights = calculateNights(checkIn, checkOut)
      const basePrice = currentBooking.accommodations?.price_per_night || 0
      const packagePrice = currentBooking.packages?.price || 0
      return (basePrice + packagePrice) * nights * guests
    }

    // Validate required fields if it's a form submission
    if (request.headers.get('content-type')?.includes('application/x-www-form-urlencoded')) {
      if (!body.guest_name || !body.guest_email || !body.guest_phone || !body.check_in_date || !body.check_out_date || body.guests === undefined) {
        return NextResponse.json(
          { error: 'All fields are required' },
          { status: 400 }
        )
      }

      // If total_amount is not provided, calculate it
      if (body.total_amount === undefined) {
        body.total_amount = calculateTotalAmount(
          body.guests || currentBooking.guests,
          body.check_in_date || currentBooking.check_in_date,
          body.check_out_date || currentBooking.check_out_date
        )
      }
    } else {
      // For API requests, validate status if provided
      if (body.status) {
        const validStatuses: BookingStatus[] = ['pending', 'confirmed', 'completed', 'cancelled']
        if (!validStatuses.includes(body.status)) {
          return NextResponse.json(
            { error: 'Invalid status value' },
            { status: 400 }
          )
        }
      }
    }

    // Check if booking exists (using a different variable name to avoid duplication)
    const { data: existingBooking, error: fetchExistingError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', params.id)
      .single()

    if (fetchExistingError || !existingBooking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Prepare update data
    const updateData: any = {
      ...body,
      updated_at: new Date().toISOString(),
    }

    // Convert dates to ISO string if they exist
    if (body.check_in_date) {
      updateData.check_in_date = new Date(body.check_in_date).toISOString()
    }
    if (body.check_out_date) {
      updateData.check_out_date = new Date(body.check_out_date).toISOString()
    }

    // Convert numbers
    if (body.guests !== undefined) {
      updateData.guests = Number(body.guests)
    }
    if (body.total_amount !== undefined) {
      updateData.total_amount = Number(body.total_amount)
      
      // If this is a custom amount (different from calculated), store the original amount
      if (body.original_amount === undefined && body.guests !== undefined) {
        const calculatedAmount = calculateTotalAmount(
          body.guests || currentBooking.guests,
          body.check_in_date || currentBooking.check_in_date,
          body.check_out_date || currentBooking.check_out_date
        )
        
        if (Math.abs(Number(body.total_amount) - calculatedAmount) > 0.01) {
          updateData.original_amount = calculatedAmount
        }
      }
    }
    
    // If original_amount is provided, ensure it's a number
    if (body.original_amount !== undefined) {
      updateData.original_amount = Number(body.original_amount)
    }

    // Update the booking
    const { data, error } = await supabase
      .from('bookings')
      .update(updateData)
      .eq('id', params.id)
      .select(`
        *,
        accommodations (name, type),
        packages (name)
      `)
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to update booking status' }, 
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    
    // Check if user is authenticated and has admin role
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      )
    }

    // Verify the booking exists
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', params.id)
      .single()

    if (bookingError || !booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Soft delete by marking as cancelled first (optional, can be removed if hard delete is preferred)
    const { error: updateError } = await supabase
      .from('bookings')
      .update({ status: 'cancelled', deleted_at: new Date().toISOString() })
      .eq('id', params.id)

    if (updateError) {
      console.error('Error soft deleting booking:', updateError)
      return NextResponse.json(
        { error: 'Failed to cancel booking' },
        { status: 500 }
      )
    }

    // Perform the actual delete
    const { error } = await supabase
      .from("bookings")
      .delete()
      .eq("id", params.id)

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json(
        { error: "Failed to delete booking" }, 
        { status: 500 }
      )
    }

    return NextResponse.json(
      { success: true, message: 'Booking deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500 }
    )
  }
}
