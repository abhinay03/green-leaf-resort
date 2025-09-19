"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Eye, Edit, Trash2, Plus, Users, Wifi, Car, Coffee } from "lucide-react"

export function AccommodationManagement() {
  const [accommodations, setAccommodations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAccommodations()
  }, [])

  const fetchAccommodations = async () => {
    try {
      const response = await fetch("/api/admin/accommodations")
      const data = await response.json()
      setAccommodations(data)
    } catch (error) {
      console.error("Failed to fetch accommodations:", error)
    } finally {
      setLoading(false)
    }
  }

  const toggleAvailability = async (id: string, isAvailable: boolean) => {
    try {
      const response = await fetch(`/api/admin/accommodations/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ is_available: !isAvailable }),
      })

      if (response.ok) {
        fetchAccommodations() // Refresh the list
      }
    } catch (error) {
      console.error("Failed to update accommodation:", error)
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "luxury_cottage":
        return "bg-purple-100 text-purple-800"
      case "swiss_tent":
        return "bg-blue-100 text-blue-800"
      case "glamping_tent":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="bg-gray-200 h-8 rounded mb-4"></div>
          <div className="bg-gray-200 h-64 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Accommodation Management</h1>
          <p className="text-gray-600">Manage resort accommodations and availability</p>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Accommodation
        </Button>
      </div>

      {/* Accommodations Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accommodations.map((accommodation: any) => (
          <Card key={accommodation.id} className="overflow-hidden">
            <div className="relative">
              <img
                src={accommodation.images?.[0] || "/placeholder.svg"}
                alt={accommodation.name}
                className="w-full h-48 object-cover"
              />
              <div className="absolute top-4 left-4">
                <Badge className={getTypeColor(accommodation.type)}>
                  {accommodation.type.replace("_", " ").toUpperCase()}
                </Badge>
              </div>
              <div className="absolute top-4 right-4">
                <Switch
                  checked={accommodation.is_available}
                  onCheckedChange={() => toggleAvailability(accommodation.id, accommodation.is_available)}
                />
              </div>
            </div>

            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-gray-900">{accommodation.name}</h3>
                <div className="text-right">
                  <div className="text-2xl font-bold text-emerald-600">₹{accommodation.price_per_night}</div>
                  <div className="text-sm text-gray-500">per night</div>
                </div>
              </div>

              <p className="text-gray-600 mb-4 line-clamp-2">{accommodation.description}</p>

              <div className="flex items-center gap-2 mb-4">
                <Users className="h-4 w-4 text-emerald-600" />
                <span className="text-sm font-medium text-gray-700">Up to {accommodation.capacity} guests</span>
              </div>

              <div className="flex gap-2 mb-4">
                {["wifi", "coffee", "car"].map((feature, index) => {
                  const icons = { wifi: Wifi, coffee: Coffee, car: Car }
                  const Icon = icons[feature as keyof typeof icons]
                  return (
                    <div key={index} className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                      <Icon className="h-4 w-4 text-emerald-600" />
                    </div>
                  )
                })}
              </div>

              <div className="flex justify-between items-center">
                <Badge variant={accommodation.is_available ? "default" : "secondary"}>
                  {accommodation.is_available ? "Available" : "Unavailable"}
                </Badge>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
