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
    titleClass: "font-serif text-5xl md:text-7xl font-bold italic tracking-tight",
    subtitleClass: "font-sans text-xl md:text-2xl font-light tracking-wider"
  },
  {
    url: "/swiss-tent.jpg",
    title: "Glamping Excellence",
    subtitle: "Adventure meets comfort",
    titleClass: "font-mono text-5xl md:text-7xl font-bold uppercase tracking-widest",
    subtitleClass: "font-sans text-xl md:text-2xl font-medium italic"
  },
  {
    url: "/tent-inside.jpg",
    title: "Luxury Swiss Tents",
    subtitle: "Unique stays in nature",
    titleClass: "font-display text-5xl md:text-7xl font-extrabold",
    subtitleClass: "font-sans text-xl md:text-2xl font-normal uppercase tracking-wider"
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
            <h1 className={`mb-6 text-balance ${heroImages[currentImage].titleClass}`}>
              {heroImages[currentImage].title}
            </h1>
            <p className={`mb-8 text-balance opacity-90 ${heroImages[currentImage].subtitleClass}`}>
              {heroImages[currentImage].subtitle}
            </p>

            <div className="flex items-center justify-center gap-2 mb-8">
              <div className="relative">
                <a 
                  href="https://www.google.com/maps/place/THE+GREEN+LEAF+RESORTS/@18.3460793,73.5377973,15z/data=!4m6!3m5!1s0x3bc2990071b12e87:0x13dee3ec9ee56f6b!8m2!3d18.3460793!4d73.5377973!16s%2Fg%2F11q2q9q9q9?entry=ttu"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-lg hover:underline flex items-center gap-2"
                >
                  <span>Panshet, Maharashtra</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                    <polyline points="15 3 21 3 21 9"></polyline>
                    <line x1="10" y1="14" x2="21" y2="3"></line>
                  </svg>
                </a>
                <div className="absolute -left-8 top-full mt-2 bg-white p-4 rounded-lg shadow-lg hidden group-hover:block z-50">
                  <p className="text-sm text-gray-700 mb-2">View location on Google Maps</p>
                  <div className="w-64 h-48 bg-gray-100 rounded overflow-hidden">
                    <img 
                      src="/map-preview.jpg" 
                      alt="Map preview" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://maps.googleapis.com/maps/api/staticmap?center=18.3460793,73.5377973&zoom=15&size=400x300&markers=color:red%7C18.3460793,73.5377973&key=YOUR_GOOGLE_MAPS_API_KEY';
                      }}
                    />
                  </div>
                  <button 
                    onClick={() => window.open('https://www.google.com/maps/place/THE+GREEN+LEAF+RESORTS/@18.3460793,73.5377973,15z/data=!4m6!3m5!1s0x3bc2990071b12e87:0x13dee3ec9ee56f6b!8m2!3d18.3460793!4d73.5377973!16s%2Fg%2F11q2q9q9q9?entry=ttu', '_blank', 'noopener,noreferrer')}
                    className="mt-2 w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors text-sm"
                  >
                    Open in Maps
                  </button>
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
                <Button 
                  size="lg" 
                  className="relative overflow-hidden group bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 text-lg w-full sm:w-auto
                    transform transition-all duration-300 hover:scale-105 hover:shadow-xl
                    before:absolute before:inset-0 before:bg-gradient-to-r before:from-emerald-500 before:to-emerald-400
                    before:opacity-0 group-hover:before:opacity-100 before:transition-opacity before:duration-300
                    animate-pulse hover:animate-none"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <span className="group-hover:translate-x-1 transition-transform duration-300">
                      Book Your Stay
                    </span>
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      width="20" 
                      height="20" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                      className="inline-block ml-1 group-hover:translate-x-1 transition-transform duration-300"
                    >
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                  </span>
                </Button>
              </Link>
              {/* <Link href="/packages" className="inline-block">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-gray-900 px-8 py-3 text-lg bg-transparent w-full sm:w-auto"
                >
                  Explore Packages
                </Button>
              </Link> */}
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
