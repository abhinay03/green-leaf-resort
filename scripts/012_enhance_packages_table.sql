-- Add new columns to packages table
ALTER TABLE public.packages
ADD COLUMN IF NOT EXISTS max_occupancy INTEGER DEFAULT 2,
ADD COLUMN IF NOT EXISTS images TEXT[],
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.package_categories(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS terms_and_conditions TEXT;

-- Create package_amenities join table
CREATE TABLE IF NOT EXISTS public.package_amenities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id UUID NOT NULL REFERENCES public.packages(id) ON DELETE CASCADE,
  amenity_id UUID NOT NULL REFERENCES public.amenities(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(package_id, amenity_id)
);

-- Enable RLS on package_amenities
ALTER TABLE public.package_amenities ENABLE ROW LEVEL SECURITY;

-- RLS policies for package_amenities
CREATE POLICY "package_amenities_select_all"
  ON public.package_amenities FOR SELECT
  USING (true);

CREATE POLICY "package_amenities_admin_only"
  ON public.package_amenities FOR ALL
  USING (auth.uid() IS NOT NULL);

-- Update existing packages with default values
UPDATE public.packages 
SET 
  max_occupancy = 2,
  images = ARRAY['/placeholder-package.jpg'],
  is_featured = false
WHERE max_occupancy IS NULL;

-- Create a function to update timestamps
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for packages table
DROP TRIGGER IF EXISTS update_packages_modtime ON public.packages;
CREATE TRIGGER update_packages_modtime
BEFORE UPDATE ON public.packages
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Create trigger for package_amenities table
DROP TRIGGER IF EXISTS update_package_amenities_modtime ON public.package_amenities;
CREATE TRIGGER update_package_amenities_modtime
BEFORE UPDATE ON public.package_amenities
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();
