// app/api/admin/stats/route.ts
import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

// Define types for our stats
interface BookingStats {
  total_bookings: number;
  today_check_ins: number;
  today_check_outs: number;
  occupancy_rate: number;
  monthly_revenue: number;
  pending_bookings: number;
}

interface Booking {
  id: string;
  status: string;
  check_in_date: string;
  check_out_date: string;
  total_amount: string | number;
  created_at: string;
  accommodation_id: string;
  deleted_at?: string | null;
}

interface Accommodation {
  id: string;
  is_active?: boolean;
}

// Fallback stats in case the database function is not available
const FALLBACK_STATS = {
  totalBookings: 0,
  todayCheckIns: 0,
  todayCheckOuts: 0,
  occupancyRate: 0,
  revenue: 0,
  pendingBookings: 0,
}

export async function GET() {
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

    // Get current date in YYYY-MM-DD format
    const today = new Date().toISOString().split("T")[0]
    // Get current month in YYYY-MM format
    const currentMonth = new Date().toISOString().slice(0, 7)

    try {
      // First, check if the function exists
      const { data: funcExists } = await supabase
        .rpc('get_admin_stats', {
          today_date: today,
          current_month: currentMonth
        })
        .select('*')
        .maybeSingle()

      if (!funcExists) {
        console.log("Function get_admin_stats does not exist or returned no data")
        return await getFallbackStats(supabase, today, currentMonth)
      }

      // If we got here, the function exists, let's get the stats
      const { data: statsData, error } = await supabase
        .rpc<BookingStats>('get_admin_stats', {
          today_date: today,
          current_month: currentMonth
        })
        .single()

      if (error) {
        console.error("Database error calling get_admin_stats:", error)
        // Fallback to direct query if function fails
        return await getFallbackStats(supabase, today, currentMonth)
      }

      // Log the raw data for debugging
      console.log("Raw stats data:", statsData)

      const stats = {
        totalBookings: Number(statsData?.total_bookings) || 0,
        todayCheckIns: Number(statsData?.today_check_ins) || 0,
        todayCheckOuts: Number(statsData?.today_check_outs) || 0,
        occupancyRate: Number(statsData?.occupancy_rate) || 0,
        revenue: Number(statsData?.monthly_revenue) || 0,
        pendingBookings: Number(statsData?.pending_bookings) || 0,
      }

      console.log("Processed stats:", stats)

      // Add cache control headers
      const response = NextResponse.json(stats)
      response.headers.set('Cache-Control', 'no-store, max-age=0')
      
      return response
    } catch (dbError) {
      console.error("Failed to fetch admin stats:", dbError)
      // Fallback to direct query
      return await getFallbackStats(supabase, today, currentMonth)
    }
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json(FALLBACK_STATS)
  }
}

// Fallback function to get stats directly if the RPC function fails
async function getFallbackStats(supabase: any, today: string, currentMonth: string) {
  try {
    console.log("Using fallback stats calculation")
    
    // Get all non-deleted bookings
    const { data: bookings, error: bookingsError } = await supabase
      .from<Booking>('bookings')
      .select('id, status, check_in_date, check_out_date, total_amount, created_at, accommodation_id')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    if (bookingsError) throw bookingsError

    // Get all accommodations
    const { data: accommodations, error: accError } = await supabase
      .from<Accommodation>('accommodations')
      .select('id, is_active')

    if (accError) {
      console.error("Error fetching accommodations:", accError)
      throw accError
    }

    // Calculate metrics
    const totalBookings = bookings?.length || 0
    const todayCheckIns = bookings?.filter((b: Booking) => 
      b.status === 'confirmed' && b.check_in_date === today
    ).length || 0
    const todayCheckOuts = bookings?.filter((b: Booking) => 
      b.status === 'checked_out' && b.check_out_date === today
    ).length || 0
    const pendingBookings = bookings?.filter((b: Booking) => 
      b.status === 'pending'
    ).length || 0
    
    const monthlyRevenue = bookings
      ?.filter((b: Booking) => 
        ['confirmed', 'completed', 'checked_in', 'checked_out'].includes(b.status) &&
        b.created_at?.startsWith(currentMonth)
      )
      .reduce((sum: number, b: Booking) => sum + (Number(b.total_amount) || 0), 0) || 0

    // Calculate occupancy
    const occupiedRooms = new Set(
      bookings
        ?.filter((b: Booking) => 
          ['confirmed', 'checked_in'].includes(b.status) &&
          b.check_in_date <= today && 
          b.check_out_date >= today
        )
        .map(b => b.accommodation_id)
    ).size

    const totalActiveRooms = accommodations?.filter(a => a.is_active !== false).length || 1 // Avoid division by zero
    const occupancyRate = Math.round((occupiedRooms / totalActiveRooms) * 100)

    const stats = {
      totalBookings,
      todayCheckIns,
      todayCheckOuts,
      occupancyRate,
      revenue: monthlyRevenue,
      pendingBookings,
    }

    console.log("Fallback stats:", stats)
    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error in fallback stats:", error)
    return NextResponse.json(FALLBACK_STATS)
  }
}