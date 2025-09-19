import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()

    const { data: incomeRecords, error } = await supabase
      .from("income_records")
      .select("*")
      .order("date", { ascending: false })

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to fetch income records" }, { status: 500 })
    }

    return NextResponse.json(incomeRecords)
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const data = await request.json()

    const { data: incomeRecord, error } = await supabase.from("income_records").insert(data).select().single()

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to create income record" }, { status: 500 })
    }

    return NextResponse.json(incomeRecord)
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
