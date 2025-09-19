import { Card, CardContent } from "@/components/ui/card"
import { Zap, GamepadIcon, Flame, Car, TreePine, Utensils, Waves, Mountain, Camera, Users } from "lucide-react"

export function AmenitiesSection() {
  const amenities = [
    {
      icon: Zap,
      title: "24-Hour Power Backup",
      description: "Uninterrupted power supply with generator backup for your peace of mind",
    },
    {
      icon: GamepadIcon,
      title: "Indoor Games",
      description: "Table tennis, carom, cards, and chess for entertainment",
    },
    {
      icon: Flame,
      title: "Bonfire Arrangements",
      description: "Cozy evenings under the stars with bonfire on request",
    },
    {
      icon: Car,
      title: "Spacious Parking",
      description: "Ample parking space for multiple vehicles",
    },
    {
      icon: TreePine,
      title: "Outdoor Games Area",
      description: "Dedicated open spaces for team fun and family activities",
    },
    {
      icon: Utensils,
      title: "Multi-Cuisine Restaurant",
      description: "Delicious local and international cuisine",
    },
    {
      icon: Waves,
      title: "Infinity Pool",
      description: "Stunning infinity pool with panoramic lake views",
    },
    {
      icon: Mountain,
      title: "Adventure Activities",
      description: "Trekking, kayaking, and water sports",
    },
    {
      icon: Camera,
      title: "Photography Tours",
      description: "Guided photography sessions in scenic locations",
    },
    {
      icon: Users,
      title: "Event Spaces",
      description: "Perfect venues for corporate retreats and celebrations",
    },
  ]

  return (
    <section id="amenities" className="py-20 bg-gradient-to-b from-emerald-50 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">World-Class Amenities</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto text-balance">
            Enjoy a seamless resort experience with our extensive facilities designed for your comfort and
            entertainment.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
          {amenities.map((amenity, index) => (
            <Card
              key={index}
              className="text-center border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group"
            >
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-emerald-600 transition-colors">
                  <amenity.icon className="h-8 w-8 text-emerald-600 group-hover:text-white transition-colors" />
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-3">{amenity.title}</h4>
                <p className="text-gray-600 text-sm leading-relaxed">{amenity.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 bg-emerald-600 rounded-3xl p-8 md:p-12 text-center text-white">
          <h3 className="text-3xl md:text-4xl font-bold mb-6">Ready for Your Perfect Getaway?</h3>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Experience luxury, adventure, and tranquility all in one place. Book your stay today and create memories
            that last a lifetime.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-emerald-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold text-lg transition-colors">
              Book Your Stay
            </button>
            <button className="border-2 border-white text-white hover:bg-white hover:text-emerald-600 px-8 py-3 rounded-lg font-semibold text-lg transition-colors">
              View Packages
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
