import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { booking_id, menu_item_id, quantity } = await request.json()

    // Get menu item details
    const { data: menuItem, error: menuError } = await supabase
      .from("menu_items")
      .select("*")
      .eq("id", menu_item_id)
      .single()

    if (menuError || !menuItem) {
      return NextResponse.json({ error: "Menu item not found" }, { status: 404 })
    }

    const totalAmount = menuItem.price * quantity

    const { data: extra, error } = await supabase
      .from("booking_extras")
      .insert({
        booking_id,
        menu_item_id,
        quantity,
        unit_price: menuItem.price,
        total_amount: totalAmount,
      })
      .select()
      .single()

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to add extra" }, { status: 500 })
    }

    // Update booking total amount
    const { data: currentBooking } = await supabase
      .from("bookings")
      .select("total_amount")
      .eq("id", booking_id)
      .single()

    if (currentBooking) {
      await supabase
        .from("bookings")
        .update({ total_amount: currentBooking.total_amount + totalAmount })
        .eq("id", booking_id)
    }

    return NextResponse.json(extra)
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
