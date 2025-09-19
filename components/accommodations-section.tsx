import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Wifi, Car, Coffee, Tv, Bath } from "lucide-react"

export function AccommodationsSection() {
  const accommodations = [
    {
      name: "Luxury Cottages",
      type: "Premium Stay",
      image: "/cottage2.webp",
      description:
        "Experience a premium stay in our Luxury Cottages, featuring spacious rooms, modern furnishings, and en-suite bathrooms with hot water.",
      capacity: "2-3 Guests",
      price: "₹3,000",
      amenities: ["King-size bed", "Private bathroom", "Lake view", "TV", "WiFi", "Room service"],
      features: [Tv, Bath, Wifi, Coffee],
    },
    {
      name: "Luxury Swiss Tents",
      type: "Nature Experience",
      image: "/tr3.webp",
      description:
        "Immerse yourself in nature without sacrificing comfort. Our Luxury Swiss Tents offer cozy interiors and private bathrooms.",
      capacity: "2-4 Guests",
      price: "₹3,000",
      amenities: ["Comfortable beds", "Private bathroom", "Garden view", "WiFi", "Breakfast included"],
      features: [Bath, Wifi, Coffee, Users],
    },
    {
      name: "Glamping Tents",
      type: "Adventure Stay",
      image: "/tent.jpg",
      description:
        "For the adventurous spirit, our Glamping Tents provide a true camping feel with basic amenities and access to clean bathrooms.",
      capacity: "2 Guests",
      price: "₹1,800",
      amenities: ["Comfortable bedding", "Shared bathroom", "Nature view", "Campfire area", "Adventure activities"],
      features: [Users, Car, Coffee],
    },
  ]

  return (
    <section id="accommodations" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Choose Your Perfect Retreat</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto text-balance">
            Diverse accommodation options blending comfort, luxury, and adventure at The Green Leaf Resorts Panshet.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {accommodations.map((accommodation, index) => (
            <Card key={index} className="overflow-hidden hover:shadow-2xl transition-shadow duration-300 group">
              <div className="relative overflow-hidden">
                <img
                  src={accommodation.image || "/placeholder.svg"}
                  alt={accommodation.name}
                  className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <Badge className="absolute top-4 left-4 bg-emerald-600 text-white">{accommodation.type}</Badge>
              </div>

              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-2xl font-bold text-gray-900">{accommodation.name}</h3>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-emerald-600">{accommodation.price}</div>
                    <div className="text-sm text-gray-500">per person</div>
                  </div>
                </div>

                <p className="text-gray-600 mb-4 leading-relaxed">{accommodation.description}</p>

                <div className="flex items-center gap-2 mb-4">
                  <Users className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm font-medium text-gray-700">{accommodation.capacity}</span>
                </div>

                <div className="flex gap-2 mb-4">
                  {accommodation.features.map((Icon, iconIndex) => (
                    <div
                      key={iconIndex}
                      className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center"
                    >
                      <Icon className="h-4 w-4 text-emerald-600" />
                    </div>
                  ))}
                </div>

                <div className="space-y-2 mb-6">
                  {accommodation.amenities.slice(0, 3).map((amenity, amenityIndex) => (
                    <div key={amenityIndex} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-emerald-600 rounded-full" />
                      <span className="text-sm text-gray-600">{amenity}</span>
                    </div>
                  ))}
                  {accommodation.amenities.length > 3 && (
                    <div className="text-sm text-emerald-600 font-medium">
                      +{accommodation.amenities.length - 3} more amenities
                    </div>
                  )}
                </div>

                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">Book Now</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
