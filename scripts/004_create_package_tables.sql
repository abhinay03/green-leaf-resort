-- Create package categories table
CREATE TABLE IF NOT EXISTS package_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create packages table
CREATE TABLE IF NOT EXISTS packages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  category_id UUID REFERENCES package_categories(id) ON DELETE SET NULL,
  price DECIMAL(10, 2) NOT NULL,
  duration INTEGER NOT NULL DEFAULT 1,
  max_occupancy INTEGER NOT NULL DEFAULT 2,
  is_active BOOLEAN DEFAULT true,
  images TEXT[],
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Create amenities table
CREATE TABLE IF NOT EXISTS amenities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create package_amenities join table
CREATE TABLE IF NOT EXISTS package_amenities (
  package_id UUID REFERENCES packages(id) ON DELETE CASCADE,
  amenity_id UUID REFERENCES amenities(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (package_id, amenity_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_packages_category ON packages(category_id);
CREATE INDEX IF NOT EXISTS idx_packages_active ON packages(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_package_amenities_package ON package_amenities(package_id);
CREATE INDEX IF NOT EXISTS idx_package_amenities_amenity ON package_amenities(amenity_id);

-- Add RLS policies for packages
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;

-- Allow admins full access
CREATE POLICY "Admins can manage packages"
  ON packages
  FOR ALL
  TO authenticated
  USING (auth.uid() IN (SELECT id FROM admin_users))
  WITH CHECK (auth.uid() IN (SELECT id FROM admin_users));

-- Allow public to read active packages
CREATE POLICY "Public can view active packages"
  ON packages
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

-- Add RLS policies for package_amenities
ALTER TABLE package_amenities ENABLE ROW LEVEL SECURITY;

-- Allow admins full access
CREATE POLICY "Admins can manage package amenities"
  ON package_amenities
  FOR ALL
  TO authenticated
  USING (auth.uid() IN (SELECT id FROM admin_users))
  WITH CHECK (auth.uid() IN (SELECT id FROM admin_users));

-- Allow public to read package amenities for active packages
CREATE POLICY "Public can view package amenities for active packages"
  ON package_amenities
  FOR SELECT
  TO anon, authenticated
  USING (
    package_id IN (
      SELECT id FROM packages WHERE is_active = true
    )
  );

-- Create a trigger to update the updated_at column
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply the trigger to all relevant tables
CREATE TRIGGER update_packages_modtime
BEFORE UPDATE ON packages
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_amenities_modtime
BEFORE UPDATE ON amenities
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_package_categories_modtime
BEFORE UPDATE ON package_categories
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- Insert some default package categories if they don't exist
INSERT INTO package_categories (name, description, display_order)
VALUES 
  ('Standard', 'Standard accommodation packages', 1),
  ('Deluxe', 'Premium accommodation packages with extra amenities', 2),
  ('Family', 'Packages designed for families', 3),
  ('Honeymoon', 'Romantic packages for couples', 4),
  ('Adventure', 'Adventure and activity packages', 5)
ON CONFLICT (name) DO NOTHING;

-- Insert some default amenities if they don't exist
INSERT INTO amenities (name, description, icon)
VALUES 
  ('Free WiFi', 'Complimentary high-speed internet access', 'wifi'),
  ('Breakfast', 'Daily breakfast included', 'coffee'),
  ('Swimming Pool', 'Access to swimming pool', 'droplets'),
  ('Spa', 'Access to spa facilities', 'spa'),
  ('Gym', 'Access to fitness center', 'dumbbell'),
  ('Parking', 'Complimentary parking', 'car'),
  ('Air Conditioning', 'Air conditioned rooms', 'snowflake'),
  ('Room Service', '24-hour room service', 'bell')
ON CONFLICT (name) DO NOTHING;
