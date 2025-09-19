import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    const supabase = await createClient()
    
    // Update accommodation prices
    const { error: updateError } = await supabase
      .from('accommodations')
      .update({ price_per_night: 3000.00 })
      .eq('name', 'Swiss Tent Deluxe')

    if (updateError) throw updateError

    const { error: updateError2 } = await supabase
      .from('accommodations')
      .update({ price_per_night: 1800.00 })
      .eq('name', 'Glamping Tent Adventure')

    if (updateError2) throw updateError2

    // Delete existing packages
    const { error: deleteError } = await supabase
      .from('packages')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all packages

    if (deleteError) throw deleteError

    // Insert new packages
    const newPackages = [
      {
        name: 'Night Stay Package',
        description: 'Perfect overnight stay with dinner and breakfast included.',
        price: 1999.00,
        duration_days: 1,
        includes: ['Dinner', 'Next Day Breakfast', 'Check-in: 6:00 PM', 'Check-out: 11:00 AM']
      },
      {
        name: 'Day Package',
        description: 'Day package with breakfast, lunch and hi-tea included.',
        price: 1299.00,
        duration_days: 1,
        includes: ['Breakfast', 'Lunch', 'Hi-Tea', 'Check-in: 9:00 AM', 'Check-out: 5:00 PM']
      },
      {
        name: 'Extended Stay Package',
        description: 'Complete package with lunch, hi-tea, dinner and next day breakfast.',
        price: 2999.00,
        duration_days: 1,
        includes: ['Lunch', 'Hi-Tea', 'Dinner', 'Next Day Breakfast', 'Check-in: 1:00 PM', 'Check-out: 11:00 AM']
      },
      {
        name: 'Room Only',
        description: 'Basic room without meals.',
        price: 1599.00,
        duration_days: 1,
        includes: ['No Meals Included', 'Room Only']
      }
    ]

    const { error: insertError } = await supabase
      .from('packages')
      .insert(newPackages)

    if (insertError) throw insertError

    return NextResponse.json({ success: true, message: 'Packages updated successfully' })
  } catch (error) {
    console.error('Error updating packages:', error)
    return NextResponse.json(
      { error: 'Failed to update packages', details: error.message },
      { status: 500 }
    )
  }
}
