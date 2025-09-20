"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Phone, Mail, MapPin, Clock } from "lucide-react"

// Dynamically import the map component with SSR disabled
const MapPreview = dynamic(() => import('./map-preview'), { ssr: false })

export function ContactSection() {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])
  const contactInfo = [
    {
      icon: Phone,
      title: "Phone",
      details: ["+91 98765 43210", "+91 87654 32109"],
    },
    {
      icon: Mail,
      title: "Email",
      details: ["info@thegreenleafresorts.com", "bookings@thegreenleafresorts.com"],
    },
    {
      icon: MapPin,
      title: "Location",
      details: ["Panshet, Maharashtra", "Near Panshet Dam"],
    },
    {
      icon: Clock,
      title: "Check-in/Check-out",
      details: ["Check-in: 2:00 PM", "Check-out: 11:00 AM"],
    },
  ]

  return (
    <section id="contact" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Get in Touch</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto text-balance">
            Ready to plan your perfect getaway? Contact us for bookings, inquiries, or any assistance you need.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-8">Contact Information</h3>
            <div className="grid sm:grid-cols-2 gap-6 mb-8">
              {contactInfo.map((info, index) => (
                <Card key={index} className="border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                        <info.icon className="h-5 w-5 text-emerald-600" />
                      </div>
                      <h4 className="font-semibold text-gray-900">{info.title}</h4>
                    </div>
                    {info.details.map((detail, detailIndex) => (
                      <p key={detailIndex} className="text-gray-600 text-sm">
                        {detail}
                      </p>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Interactive Map - Only render on client side */}
            {isMounted && (
              <Card className="border-0 shadow-lg overflow-hidden">
                <MapPreview />
              </Card>
            )}
          </div>

          {/* Contact Form */}
          <div>
            <Card className="border-0 shadow-xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h3>
                <form className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                      <Input placeholder="Your first name" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                      <Input placeholder="Your last name" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <Input type="email" placeholder="your.email@example.com" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <Input type="tel" placeholder="+91 98765 43210" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                    <Textarea
                      placeholder="Tell us about your requirements, preferred dates, or any questions you have..."
                      rows={4}
                    />
                  </div>

                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3">Send Message</Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
