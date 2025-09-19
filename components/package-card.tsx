import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Star, Users, Calendar } from "lucide-react"

interface PackageCardProps {
  pkg: {
    id: string
    name: string
    description: string | null
    price: number
    duration: number
    max_occupancy: number
    images: string[] | null
    category: {
      id: string
      name: string
      description: string | null
      is_active: boolean
      display_order: number
    } | null
    amenities: Array<{
      amenities: {
        id: string
        name: string
        description: string | null
        icon: string | null
      }
    }>
  }
}

export function PackageCard({ pkg }: PackageCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {/* Package Image */}
      <div className="relative h-48 bg-gray-200">
        {pkg.images && pkg.images.length > 0 ? (
          <img
            src={pkg.images[0]}
            alt={pkg.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
            <span>No image available</span>
          </div>
        )}
        {pkg.category && (
          <div className="absolute top-4 right-4 bg-emerald-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
            {pkg.category.name}
          </div>
        )}
      </div>

      {/* Package Details */}
      <div className="p-6">
        <div className="flex justify-between items-start">
          <h3 className="text-xl font-bold text-gray-900">{pkg.name}</h3>
          <div className="text-emerald-600 font-bold text-xl">
            ${pkg.price.toLocaleString()}
            <span className="text-sm font-normal text-gray-500"> / night</span>
          </div>
        </div>

        <p className="mt-2 text-gray-600 line-clamp-2">{pkg.description}</p>

        {/* Package Features */}
        <div className="mt-4 space-y-2 text-sm text-gray-600">
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-2 text-emerald-600" />
            <span>Up to {pkg.max_occupancy} guests</span>
          </div>
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2 text-emerald-600" />
            <span>{pkg.duration} night{pkg.duration > 1 ? 's' : ''} minimum stay</span>
          </div>
        </div>

        {/* Amenities */}
        {pkg.amenities && pkg.amenities.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Amenities</h4>
            <div className="flex flex-wrap gap-2">
              {pkg.amenities.slice(0, 3).map((item: { amenities: { name: string } }, index: number) => (
                <span key={index} className="inline-flex items-center text-xs bg-gray-100 rounded-full px-3 py-1">
                  {item.amenities.name}
                </span>
              ))}
              {pkg.amenities.length > 3 && (
                <span className="inline-flex items-center text-xs bg-gray-100 rounded-full px-3 py-1">
                  +{pkg.amenities.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        <div className="mt-6">
          <Link href={`/book?packageId=${pkg.id}`} className="w-full">
            <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
              Book Now
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
