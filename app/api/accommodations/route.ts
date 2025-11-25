import { supabasePublic } from "@/lib/supabase/public-client"
import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { data: accommodations, error } = await supabasePublic
      .from("accommodations")
      .select("*")
      .eq("is_available", true)
      .order("price_per_night", { ascending: true })

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to fetch accommodations", details: error.message }, { status: 500 })
    }

    // Always return an array, even if empty
    return NextResponse.json(accommodations || [])
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
