"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface PackageFilterProps {
  categories: Array<{
    id: string
    name: string
    description: string | null
    is_active: boolean
    display_order: number
  }>
  selectedCategory?: string
}

export function PackageFilter({ 
  categories, 
  selectedCategory 
}: PackageFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleCategoryChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (value && value !== 'all') {
      params.set('category', value)
    } else {
      params.delete('category')
    }
    
    // Reset to first page when changing filters
    params.delete('page')
    
    router.push(`/packages?${params.toString()}`)
  }

  const clearFilters = () => {
    router.push('/packages')
  }

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 bg-white rounded-lg shadow-sm border">
      <div className="w-full sm:w-auto">
        <Select
          value={selectedCategory || "all"}
          onValueChange={handleCategoryChange}
        >
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {(selectedCategory) && (
        <Button
          variant="ghost"
          onClick={clearFilters}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Clear filters
        </Button>
      )}
    </div>
  )
}
