import { createClient } from "./supabase/server"

interface BookingIdParts {
  packageCode: string
  month: string
  year: string
  sequence: number
}

/**
 * Generates a booking ID in the format: ACC-PKG-YYMM-XXX
 * Where:
 * - ACC: 3-letter accommodation type code (e.g., TNT for Tent, CTG for Cottage)
 * - PKG: 3-letter package code (or 'STD' for standard)
 * - YY: 2-digit year
 * - MM: 2-digit month
 * - XXX: 3-digit sequence number for the month
 */
export async function generateBookingId(
  accommodationId: string,
  packageId: string | null
): Promise<string> {
  const supabase = await createClient()
  const now = new Date()
  
  // Get accommodation code
  const { data: accommodation } = await supabase
    .from('accommodations')
    .select('type')
    .eq('id', accommodationId)
    .single()
  
  // Generate accommodation code (first 3 letters of type, uppercase)
  const accCode = accommodation?.type 
    ? accommodation.type.substring(0, 3).toUpperCase()
    : 'GEN' // Default if accommodation not found
  
  // Get package code or use 'STD' for standard booking
  let packageCode = 'STD'
  if (packageId) {
    const { data: pkg } = await supabase
      .from('packages')
      .select('code')
      .eq('id', packageId)
      .single()
    
    if (pkg?.code) {
      packageCode = pkg.code.substring(0, 3).toUpperCase()
    }
  }

  // Format date parts (YYMM format)
  const year = now.getFullYear().toString().slice(-2)
  const month = (now.getMonth() + 1).toString().padStart(2, '0')
  
  // Get the count of bookings for this accommodation type this month
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString()
  
  const { count } = await supabase
    .from('bookings')
    .select('*', { count: 'exact', head: true })
    .eq('accommodation_id', accommodationId)
    .gte('created_at', startOfMonth)
    .lte('created_at', endOfMonth)
  
  // Increment count by 1 for the new booking
  const sequence = (count || 0) + 1
  
  // Format: ACC-PKG-YYMM-XXX (e.g., TNT-STD-2309-001)
  return `${accCode}-${packageCode}-${year}${month}-${sequence.toString().padStart(3, '0')}`
}

/**
 * Parses a booking ID into its component parts
 */
export function parseBookingId(bookingId: string): BookingIdParts | null {
  const match = bookingId.match(/^([A-Z]{3})-?(\d{4})(\d{2})-?(\d{3})$/)
  
  if (!match) return null
  
  return {
    packageCode: match[1],
    year: match[2],
    month: match[3],
    sequence: parseInt(match[4], 10)
  }
}
