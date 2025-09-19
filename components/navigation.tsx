"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  
  // Check if we're on the homepage
  const isHomePage = pathname === "/"
  
  // Determine text color based on scroll position and current page
  const getTextColor = () => {
    if (!isHomePage) return "text-gray-900"
    return isScrolled ? "text-gray-900" : "text-white"
  }
  
  const textColor = getTextColor()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navItems = [
    { href: "/#home", label: "Home" },
    { href: "/#about", label: "About" },
    { href: "/#accommodations", label: "Accommodations" },
    { href: "/#amenities", label: "Amenities" },
    // { href: "/#team", label: "Team" },
    { href: "/#contact", label: "Contact" },
  ]

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled || !isHomePage ? "bg-white/95 backdrop-blur-md shadow-lg" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">GL</span>
            </div>
            <span className={`font-bold text-xl ${textColor}`}>
              The Green Leaf Resorts
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`font-medium transition-colors hover:text-emerald-600 ${textColor} ${
                  isScrolled || !isHomePage ? "text-gray-700" : "text-white"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <Link href="/book">
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">Book Now</Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className={isScrolled || !isHomePage ? "text-gray-900" : "text-white"} />
            ) : (
              <Menu className={isScrolled || !isHomePage ? "text-gray-900" : "text-white"} />
            )}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t shadow-lg">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block px-3 py-2 text-gray-700 hover:text-emerald-600 font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <div className="px-3 py-2">
                <Link href="/book">
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">Book Now</Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
