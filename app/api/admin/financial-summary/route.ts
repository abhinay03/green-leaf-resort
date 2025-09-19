import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()
    const currentMonth = new Date().toISOString().slice(0, 7)

    // Get total income
    const { data: incomeData } = await supabase.from("income_records").select("amount")

    // Get total expenses
    const { data: expenseData } = await supabase.from("expense_records").select("amount")

    // Get monthly income
    const { data: monthlyIncomeData } = await supabase
      .from("income_records")
      .select("amount")
      .like("date", `${currentMonth}%`)

    // Get monthly expenses
    const { data: monthlyExpenseData } = await supabase
      .from("expense_records")
      .select("amount")
      .like("date", `${currentMonth}%`)

    const totalIncome = incomeData?.reduce((sum, record) => sum + Number.parseFloat(record.amount), 0) || 0
    const totalExpenses = expenseData?.reduce((sum, record) => sum + Number.parseFloat(record.amount), 0) || 0
    const monthlyIncome = monthlyIncomeData?.reduce((sum, record) => sum + Number.parseFloat(record.amount), 0) || 0
    const monthlyExpenses = monthlyExpenseData?.reduce((sum, record) => sum + Number.parseFloat(record.amount), 0) || 0

    const summary = {
      totalIncome,
      totalExpenses,
      netProfit: totalIncome - totalExpenses,
      monthlyIncome,
      monthlyExpenses,
    }

    return NextResponse.json(summary)
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
