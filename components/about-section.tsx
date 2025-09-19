import { Card, CardContent } from "@/components/ui/card"
import { Leaf, Heart, Users, Award } from "lucide-react"

export function AboutSection() {
  const features = [
    {
      icon: Leaf,
      title: "Eco-Friendly",
      description: "Sustainable luxury that respects nature",
    },
    {
      icon: Heart,
      title: "Romantic Getaways",
      description: "Perfect for couples seeking intimacy",
    },
    {
      icon: Users,
      title: "Family Friendly",
      description: "Activities and spaces for all ages",
    },
    {
      icon: Award,
      title: "Premium Service",
      description: "Exceptional hospitality and comfort",
    },
  ]

  return (
    <section id="about" className="py-20 bg-gradient-to-b from-white to-emerald-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">About The Green Leaf Resorts</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto text-balance">
            A vision to redefine luxury in the wild—bringing people closer to nature without compromising on comfort or
            experience.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h3 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h3>
            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
              Founded by passionate nature lovers, The Green Leaf Resorts Panshet was created to offer a unique blend of
              adventure, relaxation, and luxury. Our mission is to provide families, couples, and corporate groups with
              an eco-friendly retreat where unforgettable memories are made in the lap of nature.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed">
              Nestled in the scenic beauty of Panshet, our resort offers breathtaking views, premium accommodations, and
              world-class amenities that create the perfect balance between adventure and comfort.
            </p>
          </div>
          <div className="relative">
            <img src="/kids.webp" alt="Resort founders" className="rounded-2xl shadow-2xl" />
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="h-8 w-8 text-emerald-600" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h4>
                <p className="text-gray-600">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
