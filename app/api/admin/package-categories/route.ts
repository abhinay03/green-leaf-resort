import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// Helper function to check if user is admin
async function isAdmin(supabase: any, userId: string) {
  const { data, error } = await supabase
    .from('admin_users')
    .select('id')
    .eq('id', userId)
    .single()
  
  return !error && data
}

// Helper function to handle errors
function handleError(error: any, message: string) {
  console.error(`${message}:`, error)
  return NextResponse.json(
    { error: message },
    { status: 500 }
  )
}

export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('package_categories')
      .select('*')
      .order('display_order', { ascending: true })
      .order('name', { ascending: true })

    if (error) throw error
    
    return NextResponse.json(data || [])
  } catch (error) {
    return handleError(error, 'Failed to fetch package categories')
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user || !(await isAdmin(supabase, user.id))) {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 401 }
      )
    }
    
    const categoryData = await request.json()
    
    const { data, error } = await supabase
      .from('package_categories')
      .insert([
        {
          ...categoryData,
          created_by: user.id,
          updated_by: user.id
        }
      ])
      .select()
      .single()

    if (error) throw error
    
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    return handleError(error, 'Failed to create package category')
  }
}
