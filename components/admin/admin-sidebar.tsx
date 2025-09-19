"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Calendar,
  Home,
  Package,
  Users,
  BarChart3,
  Settings,
  Menu,
  DollarSign,
  ShoppingCart,
} from "lucide-react"
import { Button } from "@/components/ui/button"

const navigation = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Bookings", href: "/admin/bookings", icon: Calendar },
  { name: "Accommodations", href: "/admin/accommodations", icon: Home },
  { 
    name: "Packages", 
    href: "/admin/packages", 
    icon: Package,
    children: [
      { name: "All Packages", href: "/admin/packages" },
      { name: "Add New", href: "/admin/packages/new" },
      { name: "Categories & Amenities", href: "/admin/packages/settings" },
    ]
  },
  { name: "Financial", href: "/admin/financial", icon: DollarSign },
  { name: "Material Orders", href: "/admin/material-orders", icon: ShoppingCart },
  { name: "Guests", href: "/admin/guests", icon: Users },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { name: "Settings", href: "/admin/settings", icon: Settings },
]

export function AdminSidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  return (
    <>
      {/* Mobile sidebar */}
      <div className={`lg:hidden fixed inset-0 z-50 ${sidebarOpen ? "block" : "hidden"}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white">
          <SidebarContent pathname={pathname} />
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col bg-white border-r border-gray-200">
          <SidebarContent pathname={pathname} />
        </div>
      </div>

      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-40">
        <Button variant="outline" size="icon" onClick={() => setSidebarOpen(true)} className="bg-white">
          <Menu className="h-5 w-5" />
        </Button>
      </div>
    </>
  )
}

function SidebarContent({ pathname }: { pathname: string }) {
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({})

  const toggleItem = (name: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [name]: !prev[name]
    }))
  }

  return (
    <>
      {/* Logo */}
      <div className="flex h-16 items-center px-6 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">GL</span>
          </div>
          <span className="font-bold text-gray-900">Admin Panel</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href || (item.children?.some(child => pathname === child.href) ?? false)
          const isExpanded = expandedItems[item.name] ?? isActive
          const hasChildren = item.children && item.children.length > 0
          
          return (
            <div key={item.name} className="space-y-1">
              <div className="flex items-center">
                <Link
                  href={item.href}
                  className={`flex-1 flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive ? "bg-emerald-100 text-emerald-700" : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  <span className="truncate">{item.name}</span>
                </Link>
                
                {hasChildren && (
                  <button
                    onClick={() => toggleItem(item.name)}
                    className="p-1 rounded-full hover:bg-gray-200 mr-1"
                    aria-label={isExpanded ? 'Collapse menu' : 'Expand menu'}
                  >
                    <svg
                      className={`h-4 w-4 text-gray-500 transition-transform ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                )}
              </div>
              
              {hasChildren && isExpanded && (
                <div className="ml-8 space-y-1">
                  {item.children?.map((child) => {
                    const isChildActive = pathname === child.href
                    return (
                      <Link
                        key={child.name}
                        href={child.href}
                        className={`block px-3 py-2 text-sm rounded-md transition-colors ${
                          isChildActive 
                            ? 'bg-emerald-50 text-emerald-700 font-medium' 
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {child.name}
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </nav>
    </>
  )
}
