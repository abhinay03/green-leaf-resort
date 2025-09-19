import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import Link from "next/link"

// Import components directly since they're client components
import { PackageCard } from "@/components/package-card"
import { PackageFilter } from "@/components/package-filter"

// Define types for our data
interface PackageCategory {
  id: string
  name: string
  description: string | null
  is_active: boolean
  display_order: number
}

interface Amenity {
  id: string
  name: string
  description: string | null
  icon: string | null
}

interface PackageAmenity {
  amenities: Amenity
}

interface Package {
  id: string
  name: string
  description: string | null
  category_id: string | null
  price: number
  duration: number
  max_occupancy: number
  is_active: boolean
  images: string[] | null
  category: PackageCategory | null
  amenities: PackageAmenity[]
}

export default async function PackagesPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const supabase = await createClient()
  
  // Fetch active packages with their categories
  const { data: packages, error } = await supabase
    .from('packages')
    .select(`
      *,
      category:package_categories(*),
      amenities:package_amenities(amenities(*))
    `)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  // Fetch all categories for the filter
  const { data: categories } = await supabase
    .from('package_categories')
    .select('*')
    .order('display_order', { ascending: true })

  // Type the data
  const typedPackages = packages as unknown as Array<{
    id: string
    name: string
    description: string | null
    price: number
    duration: number
    max_occupancy: number
    is_active: boolean
    images: string[] | null
    category: PackageCategory | null
    amenities: Array<{
      amenities: {
        id: string
        name: string
        description: string | null
        icon: string | null
      }
    }>
  }> | null

  const typedCategories = categories as unknown as PackageCategory[] | null

  // Apply filters from URL params
  const selectedCategory = searchParams.category as string
  const filteredPackages = selectedCategory && selectedCategory !== 'all'
    ? typedPackages?.filter(pkg => pkg.category?.id === selectedCategory)
    : typedPackages

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-emerald-700 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Packages</h1>
          <p className="text-xl text-emerald-100 max-w-2xl mx-auto">
            Discover our exclusive resort packages tailored for an unforgettable experience
          </p>
        </div>
      </div>

      {/* Packages Grid */}
      <div className="container mx-auto px-4 py-16">
        {/* Filter Section */}
        <PackageFilter 
          categories={typedCategories || []} 
          selectedCategory={selectedCategory} 
        />
        
        {/* Packages Grid */}
        {typedPackages && typedPackages.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
            {typedPackages.map((pkg) => (
              <PackageCard key={pkg.id} pkg={pkg} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900">No packages found</h3>
            <p className="mt-2 text-gray-500">We couldn't find any packages matching your criteria.</p>
            <div className="mt-6">
              <Link href="/packages">
                <Button variant="outline">Clear filters</Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
