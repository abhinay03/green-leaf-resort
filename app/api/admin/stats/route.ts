import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()

    // Get current date
    const today = new Date().toISOString().split("T")[0]
    const currentMonth = new Date().toISOString().slice(0, 7)

    // Fetch various statistics
    const [
      { count: totalBookings },
      { count: todayCheckIns },
      { count: todayCheckOuts },
      { data: revenueData },
      { count: totalAccommodations },
      { count: occupiedRooms },
    ] = await Promise.all([
      supabase.from("bookings").select("*", { count: "exact", head: true }),
      supabase.from("bookings").select("*", { count: "exact", head: true }).eq("check_in_date", today),
      supabase.from("bookings").select("*", { count: "exact", head: true }).eq("check_out_date", today),
      supabase.from("bookings").select("total_amount").like("created_at", `${currentMonth}%`),
      supabase.from("accommodations").select("*", { count: "exact", head: true }),
      supabase
        .from("bookings")
        .select("*", { count: "exact", head: true })
        .eq("status", "confirmed")
        .lte("check_in_date", today)
        .gte("check_out_date", today),
    ])

    const revenue = revenueData?.reduce((sum, booking) => sum + (booking.total_amount || 0), 0) || 0
    const occupancyRate = totalAccommodations ? Math.round(((occupiedRooms || 0) / totalAccommodations) * 100) : 0

    const stats = {
      totalBookings: totalBookings || 0,
      todayCheckIns: todayCheckIns || 0,
      todayCheckOuts: todayCheckOuts || 0,
      occupancyRate,
      revenue,
      pendingBookings: 0, // You can add this query if needed
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
