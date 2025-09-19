import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// This is an admin route that needs to be dynamic due to authentication
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: { 'Cache-Control': 'no-store' } }
      )
    }

    const currentMonth = new Date().toISOString().slice(0, 7)

    // Get total income
    const { data: incomeData, error: incomeError } = await supabase
      .from("income_records")
      .select("amount")
      .order("date", { ascending: false })

    // Get total expenses
    const { data: expenseData, error: expenseError } = await supabase
      .from("expense_records")
      .select("amount")
      .order("date", { ascending: false })

    // Get monthly income
    const { data: monthlyIncomeData, error: monthlyIncomeError } = await supabase
      .from("income_records")
      .select("amount")
      .like("date", `${currentMonth}%`)

    // Get monthly expenses
    const { data: monthlyExpenseData, error: monthlyExpenseError } = await supabase
      .from("expense_records")
      .select("amount")
      .like("date", `${currentMonth}%`)

    // Check for any errors
    const errors = [incomeError, expenseError, monthlyIncomeError, monthlyExpenseError].filter(Boolean)
    if (errors.length > 0) {
      console.error("Database errors:", errors)
      return NextResponse.json(
        { error: "Failed to fetch financial data" },
        { status: 500, headers: { 'Cache-Control': 'no-store' } }
      )
    }

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
      lastUpdated: new Date().toISOString()
    }

    const response = NextResponse.json(summary)
    response.headers.set('Cache-Control', 'no-store')
    return response
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    )
  }
}
