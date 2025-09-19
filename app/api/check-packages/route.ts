import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Check accommodations
    const { data: accommodations, error: accError } = await supabase
      .from('accommodations')
      .select('*')
      .in('name', ['Swiss Tent Deluxe', 'Glamping Tent Adventure'])
    
    if (accError) throw accError
    
    // Check packages
    const { data: packages, error: pkgError } = await supabase
      .from('packages')
      .select('*')
      .order('price', { ascending: true })
    
    if (pkgError) throw pkgError
    
    return NextResponse.json({
      accommodations,
      packages
    })
    
  } catch (error) {
    console.error('Error checking data:', error)
    return NextResponse.json(
      { error: 'Failed to check data', details: error.message },
      { status: 500 }
    )
  }
}
