"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Package as PackageIcon, Plus, Search, Edit, Trash2, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import Image from "next/image"
import type { Package as PackageType, PackageCategory, Amenity } from "@/types/package"
import { PackageForm } from "./package-form"

interface PackageWithCategory extends Omit<PackageType, 'category_id' | 'amenities'> {
  category?: {
    id: string
    name: string
  }
  amenities: Amenity[]
}

export function PackageManager() {
  const router = useRouter()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [packages, setPackages] = useState<PackageWithCategory[]>([])
  const [categories, setCategories] = useState<PackageCategory[]>([])
  const [amenities, setAmenities] = useState<Amenity[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState<PackageWithCategory | null>(null)

  // Reset form
  const resetForm = () => {
    setSelectedPackage(null)
  }

  // Fetch initial data
  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch packages with categories and amenities
      const [packagesRes, categoriesRes, amenitiesRes] = await Promise.all([
        fetch('/api/admin/packages?include=category,amenities'),
        fetch('/api/admin/package-categories'),
        fetch('/api/admin/amenities')
      ])
      
      if (!packagesRes.ok) throw new Error('Failed to fetch packages')
      if (!categoriesRes.ok) throw new Error('Failed to fetch categories')
      if (!amenitiesRes.ok) throw new Error('Failed to fetch amenities')
      
      const [packagesData, categoriesData, amenitiesData] = await Promise.all([
        packagesRes.json(),
        categoriesRes.json(),
        amenitiesRes.json()
      ])
      
      setPackages(packagesData)
      setCategories(categoriesData)
      setAmenities(amenitiesData)
      
    } catch (error) {
      console.error('Error fetching data:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load data"
      })
    } finally {
      setLoading(false)
    }
  }

  // Handle successful form submission
  const handleSuccess = () => {
    fetchData()
    setIsDialogOpen(false)
    resetForm()
  }

  // Handle edit package
  const handleEdit = (pkg: PackageWithCategory) => {
    setSelectedPackage(pkg)
    setIsDialogOpen(true)
  }

  // Delete package
  const handleDelete = async (id: string) => {
    if (!confirm('Delete this package?')) return
    
    try {
      const res = await fetch(`/api/admin/packages/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete failed')
      toast({ title: "Success", description: "Package deleted" })
      fetchData()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete package"
      })
    }
  }

  // Initialize
  useEffect(() => { 
    fetchData() 
  }, [])

  // Filter packages based on search term
  const filteredPackages = packages.filter(pkg => 
    pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (pkg.description ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    pkg.amenities?.some(amenity => 
      amenity.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="w-full max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search packages..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          if (!open) resetForm()
          setIsDialogOpen(open)
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Package
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedPackage ? 'Edit' : 'Add New'} Package</DialogTitle>
            </DialogHeader>
            <PackageForm 
              initialData={selectedPackage || undefined}
              categories={categories}
              amenities={amenities}
              onSuccess={handleSuccess}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Packages Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Package</TableHead>
              <TableHead>Details</TableHead>
              <TableHead>Amenities</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Loading packages...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredPackages.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <PackageIcon className="h-10 w-10 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">No packages found</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setIsDialogOpen(true)}
                      className="mt-2"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Package
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredPackages.map((pkg) => (
                <TableRow key={pkg.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      {pkg.images?.[0] ? (
                        <div className="relative h-10 w-10 rounded-md overflow-hidden">
                          <Image
                            src={pkg.images[0]}
                            alt={pkg.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center">
                          <PackageIcon className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                      <div>
                        <div className="font-medium">{pkg.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {pkg.duration} {pkg.duration === 1 ? 'night' : 'nights'}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">₹{pkg.price.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">
                      Max {pkg.max_occupancy} {pkg.max_occupancy === 1 ? 'person' : 'people'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                      {pkg.amenities?.slice(0, 3).map(amenity => (
                        <span 
                          key={amenity.id} 
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-muted text-muted-foreground"
                        >
                          {amenity.name}
                        </span>
                      ))}
                      {pkg.amenities?.length > 3 && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-muted text-muted-foreground">
                          +{pkg.amenities.length - 3} more
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      pkg.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {pkg.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(pkg)}
                        className="h-8 w-8"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(pkg.id)}
                        className="h-8 w-8 text-destructive hover:text-destructive/80"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
