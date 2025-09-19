import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import type { Package, PackageFormData } from "@/types/package"

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
    { error: message, details: error.message },
    { status }
  )
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user || !(await isAdmin(supabase, user.id))) {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const isActive = searchParams.get('is_active')
    const categoryId = searchParams.get('category_id')
    const isFeatured = searchParams.get('is_featured')

    // Build the query
    let query = supabase
      .from("packages")
      .select(`
        *,
        category:package_categories(*),
        amenities:package_amenities(amenity_id,amenities(*))
      `, { count: 'exact' })
      .order("created_at", { ascending: false })

    // Apply filters
    if (isActive !== null) {
      query = query.eq('is_active', isActive === 'true')
    }
    
    if (categoryId) {
      query = query.eq('category_id', categoryId)
    }
    
    if (isFeatured !== null) {
      query = query.eq('is_featured', isFeatured === 'true')
    }

    const { data: packages, error, count } = await query

    if (error) throw error

    // Transform the data to match our frontend expectations
    const transformedPackages = packages.map(pkg => ({
      ...pkg,
      amenities: (pkg as any).amenities?.map((pa: any) => pa.amenities) || []
    }))

    return NextResponse.json({
      data: transformedPackages,
      count: count || 0
    })
  } catch (error: any) {
    return handleError(error, "Failed to fetch packages")
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

    const {
      amenities = [],
      category_id,
      images = [],
      ...packageData
    } = await request.json() as PackageFormData
    
    // Validate required fields
    if (!packageData.name || packageData.price === undefined) {
      return NextResponse.json(
        { error: "Name and price are required" },
        { status: 400 }
      )
    }

    // Prepare package data
    const packageDetails = {
      ...packageData,
      duration_days: packageData.duration_days || 1,
      max_occupancy: packageData.max_occupancy || 2,
      is_active: packageData.is_active ?? true,
      is_featured: packageData.is_featured ?? false,
      category_id: category_id || null,
      images: images.length ? images : ['/placeholder-package.jpg'],
      includes: packageData.includes || [],
      terms_and_conditions: packageData.terms_and_conditions || '',
      created_by: user.id,
      updated_by: user.id
    }
    
    // Start a transaction
    const { data: newPackage, error } = await supabase
      .rpc('create_package_with_amenities', {
        package_data: packageDetails,
        amenity_ids: Array.isArray(amenities) 
          ? amenities.map((a: string | { id: string }) => typeof a === 'string' ? a : a.id)
          : []
      })

    if (error) throw error

    // Fetch the complete package with relations
    const { data: completePackage, error: fetchError } = await supabase
      .from('packages')
      .select(`
        *,
        category:package_categories(*),
        amenities:package_amenities(amenity_id,amenities(*))
      `)
      .eq('id', newPackage.id)
      .single()

    if (fetchError) throw fetchError

    // Transform the response
    const response = {
      ...completePackage,
      amenities: completePackage.amenities?.map((pa: any) => pa.amenities) || []
    }

    return NextResponse.json(response, { status: 201 })
  } catch (error: any) {
    return handleError(error, "Failed to create package")
  }
}

// Handle individual package operations
const dynamic = 'force-dynamic' // Prevent static optimization

export async function PUT(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user || !(await isAdmin(supabase, user.id))) {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 401 }
      )
    }

    const { id, ...updateData } = await request.json()
    
    if (!id) {
      return NextResponse.json(
        { error: "Package ID is required" },
        { status: 400 }
      )
    }

    // Update package
    const { data: updatedPackage, error: updateError } = await supabase
      .from("packages")
      .update({
        ...updateData,
        updated_by: user.id,
        updated_at: new Date().toISOString()
      })
      .eq("id", id)
      .select()
      .single()

    if (updateError) throw updateError

    // Fetch the complete updated package with relations
    const { data: completePackage, error: fetchError } = await supabase
      .from('packages')
      .select(`
        *,
        category:package_categories(*),
        amenities:package_amenities(amenity_id,amenities(*))
      `)
      .eq('id', id)
      .single()

    if (fetchError) throw fetchError

    // Transform the response
    const response = {
      ...completePackage,
      amenities: (completePackage as any).amenities?.map((pa: any) => pa.amenities) || []
    }

    return NextResponse.json(response)
  } catch (error: any) {
    return handleError(error, "Failed to update package")
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user || !(await isAdmin(supabase, user.id))) {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const permanent = searchParams.get('permanent') === 'true'
    
    if (!id) {
      return NextResponse.json(
        { error: "Package ID is required" },
        { status: 400 }
      )
    }

    // Check if the package exists and is not already deleted
    const { data: existingPackage, error: fetchError } = await supabase
      .from('packages')
      .select('id, deleted_at')
      .eq('id', id)
      .single()

    if (fetchError || !existingPackage) {
      return NextResponse.json(
        { error: "Package not found" },
        { status: 404 }
      )
    }

    let result
    
    if (permanent) {
      // Hard delete the package and related records
      const { data, error: deleteError } = await supabase.rpc('delete_package_permanently', {
        p_package_id: id,
        p_user_id: user.id
      })
      
      if (deleteError) throw deleteError
      result = data
    } else {
      // Soft delete the package
      const { data, error: updateError } = await supabase
        .from('packages')
        .update({ 
          is_active: false,
          deleted_at: new Date().toISOString(),
          updated_by: user.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()
      
      if (updateError) throw updateError
      result = data
    }

    return NextResponse.json({ 
      success: true, 
      data: result 
    })
  } catch (error: any) {
    return handleError(error, "Failed to delete package")
  }
}
