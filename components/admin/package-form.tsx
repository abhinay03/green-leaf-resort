"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Loader2, Image as ImageIcon, X, Plus } from "lucide-react"
import type { Package, PackageCategory, Amenity } from "@/types/package"

type PackageFormData = Omit<Package, 'id' | 'created_at' | 'updated_at' | 'deleted_at' | 'created_by' | 'updated_by' | 'amenities'> & {
  amenities: string[];
  category_id: string;
}

interface PackageFormProps {
  initialData?: Package | null;
  categories: PackageCategory[];
  amenities: Amenity[];
  onSuccess?: () => void;
}

export function PackageForm({ initialData, categories, amenities, onSuccess }: PackageFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<PackageFormData>({
    name: initialData?.name || '',
    description: initialData?.description || '',
    category_id: initialData?.category_id || categories[0]?.id || '',
    price: initialData?.price || 0,
    duration: initialData?.duration || 1,
    max_occupancy: initialData?.max_occupancy || 2,
    is_active: initialData?.is_active ?? true,
    images: initialData?.images || [],
    amenities: initialData?.amenities?.map(a => a.id) || []
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const url = initialData 
        ? `/api/admin/packages/${initialData.id}`
        : '/api/admin/packages'
      
      const method = initialData ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        throw new Error('Failed to save package')
      }

      toast({
        title: "Success",
        description: initialData ? "Package updated successfully!" : "Package created successfully!"
      })

      if (onSuccess) {
        onSuccess()
      } else {
        router.refresh()
      }
    } catch (error) {
      console.error('Error saving package:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save package. Please try again."
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    try {
      const formData = new FormData()
      Array.from(files).forEach(file => {
        formData.append('files', file)
      })

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Failed to upload images')
      }

      const { urls } = await response.json()
      setFormData(prev => ({
        ...prev,
        images: [...(prev.images || []), ...urls]
      }))
    } catch (error) {
      console.error('Error uploading images:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to upload images. Please try again."
      })
    }
  }

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images?.filter((_, i) => i !== index) || []
    }))
  }

  const toggleAmenity = (amenityId: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenityId)
        ? prev.amenities.filter(id => id !== amenityId)
        : [...prev.amenities, amenityId]
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Basic Information</h3>
          
          <div className="space-y-2">
            <Label htmlFor="name">Package Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="e.g., Deluxe Suite Package"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Describe the package in detail..."
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.category_id}
              onValueChange={(value) => setFormData({...formData, category_id: value})}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Pricing & Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Pricing & Details</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price (₹)</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration (nights)</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                value={formData.duration}
                onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value)})}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="max_occupancy">Max Occupancy</Label>
              <Input
                id="max_occupancy"
                type="number"
                min="1"
                value={formData.max_occupancy}
                onChange={(e) => setFormData({...formData, max_occupancy: parseInt(e.target.value)})}
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <Label htmlFor="is_active">Active</Label>
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
            />
          </div>
        </div>

        {/* Images */}
        <div className="space-y-4 md:col-span-2">
          <h3 className="text-lg font-medium">Images</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Image upload button */}
            <div className="border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center h-32 cursor-pointer hover:bg-accent/50 transition-colors">
              <input
                type="file"
                id="image-upload"
                className="hidden"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
              />
              <label htmlFor="image-upload" className="flex flex-col items-center justify-center w-full h-full cursor-pointer">
                <ImageIcon className="h-8 w-8 text-muted-foreground mb-2" />
                <span className="text-sm text-muted-foreground text-center">
                  Click to upload or drag and drop
                </span>
                <span className="text-xs text-muted-foreground mt-1">
                  (up to 5 images)
                </span>
              </label>
            </div>

            {/* Image previews */}
            {formData.images?.map((image, index) => (
              <div key={index} className="relative group h-32 rounded-lg overflow-hidden">
                <img
                  src={image}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    removeImage(index)
                  }}
                  className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Amenities */}
        <div className="space-y-4 md:col-span-2">
          <h3 className="text-lg font-medium">Amenities</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {amenities.map((amenity) => (
              <div key={amenity.id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={`amenity-${amenity.id}`}
                  checked={formData.amenities.includes(amenity.id)}
                  onChange={() => toggleAmenity(amenity.id)}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label htmlFor={`amenity-${amenity.id}`} className="text-sm font-medium leading-none">
                  {amenity.name}
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-4 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={() => onSuccess?.()}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {initialData ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            <>{initialData ? 'Update Package' : 'Create Package'}</>
          )}
        </Button>
      </div>
    </form>
  )
}
