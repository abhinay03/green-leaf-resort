"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Star } from "lucide-react"
import Link from "next/link"

const heroImages = [
  {
    url: "/full2.jpg",
    title: "Luxury Resort Paradise",
    subtitle: "Experience nature's luxury at Panshet",
  },
  {
    url: "/swiss-tent.jpg",
    title: "Glamping Excellence",
    subtitle: "Adventure meets comfort",
  },
  {
    url: "/tent-inside.jpg",
    title: "Luxury Swiss Tents",
    subtitle: "Unique stays in nature",
  },
]

export function HeroSection() {
  const [currentImage, setCurrentImage] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % heroImages.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % heroImages.length)
  }

  const prevImage = () => {
    setCurrentImage((prev) => (prev - 1 + heroImages.length) % heroImages.length)
  }

  return (
    <section id="home" className="relative h-screen overflow-hidden">
      {/* Background Images */}
      {heroImages.map((image, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentImage ? "opacity-100" : "opacity-0"
          }`}
        >
          <img src={image.url || "/placeholder.svg"} alt={image.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40" />
        </div>
      ))}

      {/* Navigation Arrows */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 z-10"
        onClick={prevImage}
      >
        <ChevronLeft className="h-8 w-8" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 z-10"
        onClick={nextImage}
      >
        <ChevronRight className="h-8 w-8" />
      </Button>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center justify-center text-center text-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="animate-fade-in-up">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 text-balance">{heroImages[currentImage].title}</h1>
            <p className="text-xl md:text-2xl mb-8 text-balance opacity-90">{heroImages[currentImage].subtitle}</p>

            <div className="flex items-center justify-center gap-2 mb-8">
              <div className="relative group">
                <button 
                  className="text-lg hover:underline flex items-center gap-2"
                  onClick={() => window.open('https://maps.app.goo.gl/your-google-maps-link', '_blank')}
                >
                  <span>Panshet, Maharashtra</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                    <polyline points="15 3 21 3 21 9"></polyline>
                    <line x1="10" y1="14" x2="21" y2="3"></line>
                  </svg>
                </button>
                <div className="absolute hidden group-hover:block z-50 w-80 h-60 -left-40 top-full mt-2 bg-white shadow-lg rounded-lg overflow-hidden">
                  <iframe 
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15148.105660638865!2d73.5377973!3d18.3460793!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc2990071b12e87%3A0x13dee3ec9ee56f6b!2sTHE%20GREEN%20LEAF%20RESORTS!5e0!3m2!1sen!2sin!4v1757533084634!5m2!1sen!2sin" 
                    width="100%" 
                    height="100%" 
                    style={{ border: 0 }} 
                    allowFullScreen 
                    loading="lazy" 
                    referrerPolicy="no-referrer-when-downgrade"
                    title="The Green Leaf Resorts Location"
                  ></iframe>
                </div>
              </div>
              <div className="flex items-center gap-1 ml-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
                <span className="ml-2">5/5</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/book" className="inline-block">
                <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 text-lg w-full sm:w-auto">
                  Book Your Stay
                </Button>
              </Link>
              <Link href="/packages" className="inline-block">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-gray-900 px-8 py-3 text-lg bg-transparent w-full sm:w-auto"
                >
                  Explore Packages
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Image Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {heroImages.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full transition-all ${index === currentImage ? "bg-white" : "bg-white/50"}`}
            onClick={() => setCurrentImage(index)}
          />
        ))}
      </div>
    </section>
  )
}
