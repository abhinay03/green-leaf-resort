"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Trash2, Edit, Loader2, Package, Star, X } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

type Category = {
  id: string
  name: string
  description: string
  is_active: boolean
  display_order: number
}

type Amenity = {
  id: string
  name: string
  description: string
  icon: string
}

type FormData = {
  id?: string
  name: string
  description: string
  is_active: boolean
  display_order?: number
  icon?: string
}

export function PackageSettings() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("categories")
  const [categories, setCategories] = useState<Category[]>([])
  const [amenities, setAmenities] = useState<Amenity[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    is_active: true,
    display_order: 0
  })

  // Fetch data based on active tab
  const fetchData = async () => {
    try {
      setLoading(true)
      const endpoint = activeTab === "categories" 
        ? "/api/admin/package-categories" 
        : "/api/admin/amenities"
      
      const response = await fetch(endpoint)
      if (!response.ok) throw new Error(`Failed to fetch ${activeTab}`)
      
      const data = await response.json()
      if (activeTab === "categories") {
        setCategories(data)
      } else {
        setAmenities(data)
      }
    } catch (error) {
      console.error(`Error fetching ${activeTab}:`, error)
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to load ${activeTab}`
      })
    } finally {
      setLoading(false)
    }
  }

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const isEdit = !!formData.id
      const endpoint = activeTab === "categories"
        ? `/api/admin/package-categories${isEdit ? `/${formData.id}` : ''}`
        : `/api/admin/amenities${isEdit ? `/${formData.id}` : ''}`
      
      const method = isEdit ? 'PUT' : 'POST'
      
      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Failed to ${isEdit ? 'update' : 'create'} ${activeTab === 'categories' ? 'category' : 'amenity'}`)
      }
      
      toast({
        title: "Success",
        description: `${activeTab === 'categories' ? 'Category' : 'Amenity'} ${isEdit ? 'updated' : 'created'} successfully!`
      })
      
      setIsDialogOpen(false)
      fetchData()
      resetForm()
    } catch (error) {
      console.error(`Error submitting form:`, error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!confirm(`Are you sure you want to delete this ${activeTab === 'categories' ? 'category' : 'amenity'}?`)) return
    
    try {
      const endpoint = activeTab === "categories"
        ? `/api/admin/package-categories/${id}`
        : `/api/admin/amenities/${id}`
      
      const response = await fetch(endpoint, { method: 'DELETE' })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Failed to delete ${activeTab === 'categories' ? 'category' : 'amenity'}`)
      }
      
      toast({
        title: "Success",
        description: `${activeTab === 'categories' ? 'Category' : 'Amenity'} deleted successfully!`
      })
      
      fetchData()
    } catch (error) {
      console.error(`Error deleting ${activeTab}:`, error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred"
      })
    }
  }

  // Reset form
  const resetForm = () => {
    setFormData({
      id: undefined,
      name: "",
      description: "",
      is_active: true,
      display_order: 0,
      icon: ""
    })
  }

  // Initialize form for editing
  const initEdit = (item: Category | Amenity) => {
    setFormData({
      id: item.id,
      name: item.name,
      description: item.description || "",
      is_active: 'is_active' in item ? (item as Category).is_active : true,
      display_order: 'display_order' in item ? (item as Category).display_order : 0,
      icon: 'icon' in item ? (item as Amenity).icon : ""
    })
    setIsDialogOpen(true)
  }

  // Fetch data when tab changes
  useEffect(() => {
    fetchData()
  }, [activeTab])

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="categories">
              <Package className="h-4 w-4 mr-2" />
              Categories
            </TabsTrigger>
            <TabsTrigger value="amenities">
              <Star className="h-4 w-4 mr-2" />
              Amenities
            </TabsTrigger>
          </TabsList>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                onClick={() => {
                  resetForm()
                  setIsDialogOpen(true)
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add {activeTab === 'categories' ? 'Category' : 'Amenity'}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {formData.id ? 'Edit' : 'Add New'} {activeTab === 'categories' ? 'Category' : 'Amenity'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder={`Enter ${activeTab === 'categories' ? 'category' : 'amenity'} name`}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full p-2 border rounded min-h-[80px]"
                    placeholder={`Enter ${activeTab === 'categories' ? 'category' : 'amenity'} description`}
                  />
                </div>
                
                {activeTab === 'categories' && (
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Display Order
                    </label>
                    <Input
                      type="number"
                      value={formData.display_order}
                      onChange={(e) => setFormData({...formData, display_order: parseInt(e.target.value) || 0})}
                      min="0"
                    />
                  </div>
                )}
                
                {activeTab === 'amenities' && (
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Icon Name (optional)
                    </label>
                    <Input
                      value={formData.icon || ''}
                      onChange={(e) => setFormData({...formData, icon: e.target.value})}
                      placeholder="e.g., wifi, coffee, tv"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Use icon names from Lucide Icons (https://lucide.dev/icons/)
                    </p>
                  </div>
                )}
                
                <div className="flex items-center space-x-2 pt-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                    className="h-4 w-4 rounded"
                  />
                  <label htmlFor="is_active" className="text-sm">
                    Active
                  </label>
                </div>
                
                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsDialogOpen(false)
                      resetForm()
                    }}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      `${formData.id ? 'Update' : 'Create'} ${activeTab === 'categories' ? 'Category' : 'Amenity'}`
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        
        <TabsContent value={activeTab} className="mt-6">
          <div className="rounded-md border">
            {loading ? (
              <div className="flex justify-center items-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    {activeTab === 'categories' && <TableHead>Order</TableHead>}
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(activeTab === 'categories' ? categories : amenities).length === 0 ? (
                    <TableRow>
                      <TableCell 
                        colSpan={activeTab === 'categories' ? 5 : 4} 
                        className="text-center py-8 text-gray-500"
                      >
                        No {activeTab} found. Click the "Add {activeTab === 'categories' ? 'Category' : 'Amenity'}" button to create one.
                      </TableCell>
                    </TableRow>
                  ) : (
                    (activeTab === 'categories' ? categories : amenities).map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            {activeTab === 'amenities' && 'icon' in item && item.icon && (
                              <div className="mr-2 flex items-center justify-center w-6 h-6 rounded bg-gray-100">
                                <span className="text-xs">{item.icon}</span>
                              </div>
                            )}
                            {item.name}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[300px] truncate" title={item.description || ''}>
                          {item.description || '-'}
                        </TableCell>
                        {activeTab === 'categories' && (
                          <TableCell>
                            {(item as Category).display_order}
                          </TableCell>
                        )}
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            'is_active' in item && item.is_active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {'is_active' in item && item.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => initEdit(item)}
                              className="h-8 w-8"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(item.id)}
                              className="h-8 w-8 text-red-600 hover:text-red-800 hover:bg-red-50"
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
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
