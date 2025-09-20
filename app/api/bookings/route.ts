import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"
import { generateBookingId } from "@/lib/booking-utils"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const bookingData = await request.json()

    // First, insert the booking without the booking_id to get the ID
    const { data: booking, error: insertError } = await supabase
      .from("bookings")
      .insert({
        accommodation_id: bookingData.accommodation_id,
        package_id: bookingData.package_id,
        check_in_date: bookingData.check_in_date,
        check_out_date: bookingData.check_out_date,
        guests: bookingData.guests,
        total_amount: bookingData.total_amount,
        guest_name: bookingData.guest_name,
        guest_email: bookingData.guest_email,
        guest_phone: bookingData.guest_phone,
        special_requests: bookingData.special_requests,
        status: "pending",
        user_id: null, // For now, allowing guest bookings
        synced: true,
      })
      .select()
      .single()

    if (insertError) {
      console.error("Booking error:", insertError)
      return NextResponse.json(
        { error: "Failed to create booking", details: insertError.message },
        { status: 500 }
      )
    }

    // Generate the booking ID with the inserted booking's ID
    const bookingId = await generateBookingId(
      bookingData.accommodation_id, 
      bookingData.package_id
    )

    // Try to update with the generated booking ID
    const { error: updateError } = await supabase
      .from("bookings")
      .update({ booking_id: bookingId })
      .eq("id", booking.id)

    if (updateError) {
      console.warn("Warning: Could not set booking_id:", updateError)
      // Continue even if we can't set the booking_id
      return NextResponse.json({ 
        booking: { ...booking, booking_id: null },
        bookingId: null,
        warning: "Booking created but could not set booking_id"
      })
    }

    return NextResponse.json({ 
      booking: { ...booking, booking_id: bookingId },
      bookingId 
    })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const supabase = await createClient()

    const { data: bookings, error } = await supabase
      .from("bookings")
      .select(`
        *,
        accommodations (name, type),
        packages (name)
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 })
    }

    return NextResponse.json(bookings)
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
