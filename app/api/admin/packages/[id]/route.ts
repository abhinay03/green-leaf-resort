import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// Helper function to check admin status
async function isAdmin(supabase: any, userId: string) {
  const { data: adminUser } = await supabase
    .from("admin_users")
    .select("*")
    .eq("id", userId)
    .single()
  
  return !!adminUser
}

// Helper function to handle errors
function handleError(error: any, message: string, status = 500) {
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
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user || !(await isAdmin(supabase, user.id))) {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 401 }
      )
    }

    const { id } = params
    
    // Fetch package with related data
    const { data: pkg, error } = await supabase
      .from("packages")
      .select(`
        *,
        amenities (*)
      `)
      .eq("id", id)
      .single()

    if (error) throw error
    if (!pkg) {
      return NextResponse.json(
        { error: "Package not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(pkg)
  } catch (error) {
    return handleError(error, "Failed to fetch package")
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
    const { amenities, ...updateData } = await request.json()
    
    // Start a transaction to update package and its amenities
    const { data: updatedPackage, error } = await supabase.rpc(
      'update_package_with_amenities',
      {
        package_id: id,
        package_data: {
          ...updateData,
          updated_by: user.id
        },
        amenity_ids: (amenities || []).map((a: any) => a.id || a)
      }
    )

    if (error) throw error

    return NextResponse.json(updatedPackage)
  } catch (error) {
    return handleError(error, "Failed to update package")
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
    
    // Soft delete the package
    const { data: deletedPackage, error: deleteError } = await supabase
      .from("packages")
      .update({
        is_active: false,
        deleted_at: new Date().toISOString(),
        updated_by: user.id,
        updated_at: new Date().toISOString()
      })
      .eq("id", id)
      .select()
      .single()

    if (deleteError) throw deleteError

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleError(error, "Failed to delete package")
  }
}
