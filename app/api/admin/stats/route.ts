import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic' // Ensure this is dynamic since it contains user-specific data

export async function GET(request: Request) {
  try {
    const supabase = createClient()
    
    // Check if user is authenticated and has admin role
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get current date
    const today = new Date().toISOString().split("T")[0]
    const currentMonth = new Date().toISOString().slice(0, 7)

    // Fetch various statistics using a single query with RPC for better performance
    const { data: statsData, error } = await supabase.rpc('get_admin_stats', {
      today_date: today,
      current_month: currentMonth
    })

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json(
        { error: "Failed to fetch statistics" },
        { status: 500 }
      )
    }

    const stats = {
      totalBookings: statsData?.[0]?.total_bookings || 0,
      todayCheckIns: statsData?.[0]?.today_check_ins || 0,
      todayCheckOuts: statsData?.[0]?.today_check_outs || 0,
      occupancyRate: statsData?.[0]?.occupancy_rate || 0,
      revenue: statsData?.[0]?.monthly_revenue || 0,
      pendingBookings: statsData?.[0]?.pending_bookings || 0,
    }

    // Add cache control headers
    const response = NextResponse.json(stats)
    response.headers.set('Cache-Control', 'no-store, max-age=0')
    
    return response
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
