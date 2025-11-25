import { supabasePublic } from "@/lib/supabase/public-client"
import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const { data: packages, error } = await supabasePublic
      .from("packages")
      .select("*")
      .eq("is_active", true)
      .order("price", { ascending: true })

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to fetch packages", details: error.message }, { status: 500 })
    }

    // Always return an array, even if empty
    return NextResponse.json(packages || [])
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
