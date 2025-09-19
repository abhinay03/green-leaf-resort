import { Leaf, Phone, Mail, MapPin, Facebook, Instagram, Twitter } from "lucide-react"
import Link from "next/link"

export function Footer() {
  const quickLinks = [
    { href: "#home", label: "Home" },
    { href: "#about", label: "About" },
    { href: "#accommodations", label: "Accommodations" },
    { href: "#amenities", label: "Amenities" },
    { href: "#team", label: "Team" },
    { href: "#contact", label: "Contact" },
  ]

  const services = [
    "Luxury Cottages",
    "Swiss Tents",
    "Glamping Tents",
    "Corporate Retreats",
  ]

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center">
                <Leaf className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold">The Green Leaf Resorts</span>
            </div>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Experience luxury in nature's embrace. Creating unforgettable memories in the scenic beauty of Panshet,
              Maharashtra.
            </p>
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-emerald-600 transition-colors cursor-pointer">
                <Facebook className="h-5 w-5" />
              </div>
              <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-emerald-600 transition-colors cursor-pointer">
                <Instagram className="h-5 w-5" />
              </div>
              <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-emerald-600 transition-colors cursor-pointer">
                <Twitter className="h-5 w-5" />
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Quick Links</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-gray-400 hover:text-emerald-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Our Services</h4>
            <ul className="space-y-3">
              {services.map((service) => (
                <li key={service}>
                  <span className="text-gray-400">{service}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Contact Info</h4>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-emerald-400" />
                <span className="text-gray-400">Panshet, Maharashtra</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-emerald-400" />
                <span className="text-gray-400">+91 98765 43210</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-emerald-400" />
                <span className="text-gray-400">abhiiinayyy@gmail.com</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 text-center">
          <p className="text-gray-400">
            © 2025 The Green Leaf Resorts. All rights reserved. |
            <span className="text-emerald-400"> Privacy Policy</span> |
            <span className="text-emerald-400"> Terms of Service</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
