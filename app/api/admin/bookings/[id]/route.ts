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
  special_requests?: string
  // Add other fields that can be updated here
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
    
    // Validate required fields if it's a form submission
    if (request.headers.get('content-type')?.includes('application/x-www-form-urlencoded')) {
      if (!body.guest_name || !body.guest_email || !body.guest_phone || !body.check_in_date || !body.check_out_date || !body.guests) {
        return NextResponse.json(
          { error: 'All fields are required' },
          { status: 400 }
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

    // Check if booking exists
    const { data: existingBooking, error: fetchError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', params.id)
      .single()

    if (fetchError || !existingBooking) {
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

    // Convert guests to number if it exists
    if (body.guests) {
      updateData.guests = Number(body.guests)
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
