import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const bookingData = await request.json()

    // Generate a unique booking ID
    const bookingId = `GLR${Date.now().toString().slice(-6)}`

    const { data: booking, error } = await supabase
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

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to create booking" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      booking_id: bookingId,
      booking: booking,
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
