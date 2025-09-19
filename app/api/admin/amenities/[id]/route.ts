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
function handleError(error: any, message: string, status: number = 500) {
  console.error(`${message}:`, error)
  return NextResponse.json(
    { error: message },
    { status }
  )
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { id } = params
    
    const { data, error } = await supabase
      .from('amenities')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    if (!data) {
      return NextResponse.json(
        { error: 'Amenity not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(data)
  } catch (error) {
    return handleError(error, 'Failed to fetch amenity')
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user || !(await isAdmin(supabase, user.id))) {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 401 }
      )
    }
    
    const { id } = params
    const updateData = await request.json()
    
    const { data, error } = await supabase
      .from('amenities')
      .update({
        ...updateData,
        updated_by: user.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    
    return NextResponse.json(data)
  } catch (error) {
    return handleError(error, 'Failed to update amenity')
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user || !(await isAdmin(supabase, user.id))) {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 401 }
      )
    }
    
    const { id } = params
    
    // Check if there are any packages using this amenity
    const { data: packages, error: packagesError } = await supabase
      .from('package_amenities')
      .select('package_id')
      .eq('amenity_id', id)
      .limit(1)
    
    if (packagesError) throw packagesError
    
    if (packages && packages.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete amenity that is in use by packages' },
        { status: 400 }
      )
    }
    
    const { error } = await supabase
      .from('amenities')
      .delete()
      .eq('id', id)

    if (error) throw error
    
    return NextResponse.json({ success: true })
  } catch (error) {
    return handleError(error, 'Failed to delete amenity')
  }
}
