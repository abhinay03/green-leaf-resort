import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()

    const { data: expenseRecords, error } = await supabase
      .from("expense_records")
      .select("*")
      .order("date", { ascending: false })

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to fetch expense records" }, { status: 500 })
    }

    return NextResponse.json(expenseRecords)
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const data = await request.json()

    const { data: expenseRecord, error } = await supabase.from("expense_records").insert(data).select().single()

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to create expense record" }, { status: 500 })
    }

    return NextResponse.json(expenseRecord)
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
