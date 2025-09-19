import { Card, CardContent } from "@/components/ui/card"

export function TeamSection() {
  const team = [
    {
      name: "Abhishek Barve",
      role: "Co-Founder & Visionary",
      image: "/professional-headshot-of-resort-co-founder-in-natu.jpg",
      description: "Passionate about creating unique experiences that blend luxury with nature's beauty.",
    },
    {
      name: "Sachin Gaikwad",
      role: "Co-Founder – A Perfectionist on Every Detail",
      image: "/professional-headshot-of-resort-co-founder-with-at.jpg",
      description: "Ensures every aspect of your stay meets the highest standards of excellence.",
    },
  ]

  return (
    <section id="team" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Meet Our Dedicated Team</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto text-balance">
            The passionate founders behind The Green Leaf Resorts, committed to delivering exceptional experiences in
            nature's embrace.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
          {team.map((member, index) => (
            <Card
              key={index}
              className="text-center border-0 shadow-xl hover:shadow-2xl transition-shadow duration-300"
            >
              <CardContent className="p-8">
                <div className="relative mb-6">
                  <img
                    src={member.image || "/placeholder.svg"}
                    alt={member.name}
                    className="w-48 h-48 rounded-full mx-auto object-cover shadow-lg"
                  />
                  <div className="absolute inset-0 rounded-full bg-emerald-600/10" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{member.name}</h3>
                <p className="text-emerald-600 font-semibold mb-4">{member.role}</p>
                <p className="text-gray-600 leading-relaxed">{member.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
