import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()

    const { data: orders, error } = await supabase
      .from("material_orders")
      .select(`
        *,
        material_order_items (*)
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
    }

    return NextResponse.json(orders)
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { items, ...orderData } = await request.json()

    // Create the order
    const { data: order, error: orderError } = await supabase
      .from("material_orders")
      .insert(orderData)
      .select()
      .single()

    if (orderError) {
      console.error("Database error:", orderError)
      return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
    }

    // Create order items
    const orderItems = items.map((item: any) => ({
      ...item,
      order_id: order.id,
      total_price: item.quantity * item.unit_price,
    }))

    const { error: itemsError } = await supabase.from("material_order_items").insert(orderItems)

    if (itemsError) {
      console.error("Database error:", itemsError)
      return NextResponse.json({ error: "Failed to create order items" }, { status: 500 })
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
