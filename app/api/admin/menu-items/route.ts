import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()

    const { data: menuItems, error } = await supabase
      .from("menu_items")
      .select("*")
      .eq("is_available", true)
      .order("category", { ascending: true })

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to fetch menu items" }, { status: 500 })
    }

    return NextResponse.json(menuItems)
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const data = await request.json()

    const { data: menuItem, error } = await supabase.from("menu_items").insert(data).select().single()

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to create menu item" }, { status: 500 })
    }

    return NextResponse.json(menuItem)
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
