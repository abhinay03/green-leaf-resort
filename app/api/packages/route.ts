import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()

    const { data: packages, error } = await supabase
      .from("packages")
      .select("*")
      .eq("is_active", true)
      .order("price", { ascending: true })

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to fetch packages" }, { status: 500 })
    }

    const response = NextResponse.json(packages)
    
    // Prevent caching
    response.headers.set('Cache-Control', 'no-store, max-age=0')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    
    return response
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
