export type Package = {
  id: string;
  name: string;
  description: string;
  category_id?: string | null;
  category?: {
    id: string;
    name: string;
    description?: string | null;
  };
  price: number;
  duration_days: number;
  max_occupancy: number;
  is_active: boolean;
  is_featured: boolean;
  images: string[];
  includes: string[];
  terms_and_conditions?: string | null;
  amenities?: Amenity[];
  created_by?: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
};

export type PackageFormData = Omit<
  Package,
  'id' | 'created_at' | 'updated_at' | 'deleted_at' | 'created_by' | 'updated_by' | 'amenities' | 'category'
> & {
  amenities: string[];
};

export type PackageCategory = {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
};

export type Amenity = {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  created_at: string;
  updated_at: string;
};

export type PackageFilterParams = {
  category_id?: string;
  min_price?: number;
  max_price?: number;
  min_duration?: number;
  max_duration?: number;
  min_occupancy?: number;
  search?: string;
  is_active?: boolean;
  sort_by?: 'price' | 'duration' | 'name' | 'created_at';
  sort_order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
};
