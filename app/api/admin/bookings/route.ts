import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// This is an admin route that needs to be dynamic due to authentication
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: { 'Cache-Control': 'no-store' } }
      )
    }

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
      return NextResponse.json(
        { error: "Failed to fetch bookings" },
        { status: 500, headers: { 'Cache-Control': 'no-store' } }
      )
    }

    const response = NextResponse.json(bookings)
    response.headers.set('Cache-Control', 'no-store')
    return response
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    )
  }
}
