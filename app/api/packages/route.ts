import { supabasePublic } from "@/lib/supabase/public-client"
import { NextResponse } from "next/server"

// This route is public and can be statically generated
export const dynamic = 'force-static'

export async function GET() {
  try {
    const { data: packages, error } = await supabasePublic
      .from("packages")
      .select("*")
      .eq("is_active", true)
      .order("price", { ascending: true })

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to fetch packages" }, { status: 500 })
    }

    const response = NextResponse.json(packages)
    
    // Cache for 1 hour, allow stale-while-revalidate
    response.headers.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=3600')
    
    return response
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
