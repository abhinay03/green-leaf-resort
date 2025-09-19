import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { Database } from "@/types/supabase"

export const dynamic = 'force-dynamic' // Ensure this is dynamic since it contains user-specific data

// Fallback stats in case the database function is not available
const FALLBACK_STATS = {
  totalBookings: 0,
  todayCheckIns: 0,
  todayCheckOuts: 0,
  occupancyRate: 0,
  revenue: 0,
  pendingBookings: 0,
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    
    // Check if user is authenticated
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

    try {
      // Attempt to fetch statistics using the RPC function
      const { data: statsData, error } = await supabase.rpc('get_admin_stats', {
        today_date: today,
        current_month: currentMonth
      })

      if (error) {
        console.error("Database error:", error)
        // Return fallback data if the function fails
        return NextResponse.json(FALLBACK_STATS)
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
    } catch (dbError) {
      console.error("Failed to fetch admin stats:", dbError)
      // Return fallback data if there's an error
      return NextResponse.json(FALLBACK_STATS)
    }
  } catch (error) {
    console.error("API error:", error)
    // Return fallback data if there's an error
    return NextResponse.json(FALLBACK_STATS)
  }
}
