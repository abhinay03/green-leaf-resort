import { supabasePublic } from "@/lib/supabase/public-client"
import { NextResponse } from "next/server"

// This route is public and can be statically generated
export const dynamic = 'force-static'

export async function GET() {
  try {
    // Check accommodations
    const { data: accommodations, error: accError } = await supabasePublic
      .from('accommodations')
      .select('*')
      .in('name', ['Swiss Tent Deluxe', 'Glamping Tent Adventure'])
    
    if (accError) throw accError
    
    // Check packages
    const { data: packages, error: pkgError } = await supabasePublic
      .from('packages')
      .select('*')
      .order('price', { ascending: true })
    
    if (pkgError) throw pkgError
    
    const response = NextResponse.json({
      accommodations,
      packages
    })
    
    // Cache for 1 hour, allow stale-while-revalidate
    response.headers.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=3600')
    
    return response
    
  } catch (error) {
    console.error('Error checking data:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Failed to check data', details: errorMessage },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    )
  }
}
