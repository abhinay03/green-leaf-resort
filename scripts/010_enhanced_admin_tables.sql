-- Create tables for enhanced admin functionality

-- Menu items for extra billing
CREATE TABLE IF NOT EXISTS menu_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category VARCHAR(100) NOT NULL, -- food, beverage, service, activity
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Extra charges for bookings
CREATE TABLE IF NOT EXISTS booking_extras (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES menu_items(id),
  quantity INTEGER DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  added_by UUID REFERENCES admin_users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Income tracking
CREATE TABLE IF NOT EXISTS income_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID REFERENCES bookings(id),
  amount DECIMAL(10,2) NOT NULL,
  source VARCHAR(100) NOT NULL, -- booking, extras, other
  description TEXT,
  date DATE NOT NULL,
  recorded_by UUID REFERENCES admin_users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Expense tracking
CREATE TABLE IF NOT EXISTS expense_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category VARCHAR(100) NOT NULL, -- maintenance, supplies, utilities, staff, marketing
  amount DECIMAL(10,2) NOT NULL,
  description TEXT NOT NULL,
  vendor VARCHAR(255),
  date DATE NOT NULL,
  receipt_url TEXT,
  recorded_by UUID REFERENCES admin_users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Material orders
CREATE TABLE IF NOT EXISTS material_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  supplier VARCHAR(255) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending', -- pending, ordered, received, cancelled
  order_date DATE NOT NULL,
  expected_delivery DATE,
  actual_delivery DATE,
  notes TEXT,
  created_by UUID REFERENCES admin_users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Material order items
CREATE TABLE IF NOT EXISTS material_order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES material_orders(id) ON DELETE CASCADE,
  item_name VARCHAR(255) NOT NULL,
  description TEXT,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  received_quantity INTEGER DEFAULT 0
);

-- Room availability tracking
CREATE TABLE IF NOT EXISTS room_availability (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  accommodation_id UUID REFERENCES accommodations(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  is_available BOOLEAN DEFAULT true,
  reason VARCHAR(255), -- maintenance, cleaning, blocked
  notes TEXT,
  updated_by UUID REFERENCES admin_users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(accommodation_id, date)
);

-- Enable RLS
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_extras ENABLE ROW LEVEL SECURITY;
ALTER TABLE income_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE material_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE material_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_availability ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admin can manage menu items" ON menu_items FOR ALL USING (
  EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admin can manage booking extras" ON booking_extras FOR ALL USING (
  EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admin can manage income records" ON income_records FOR ALL USING (
  EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admin can manage expense records" ON expense_records FOR ALL USING (
  EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admin can manage material orders" ON material_orders FOR ALL USING (
  EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admin can manage material order items" ON material_order_items FOR ALL USING (
  EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admin can manage room availability" ON room_availability FOR ALL USING (
  EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid() AND role = 'admin')
);

-- Sample menu items
INSERT INTO menu_items (name, description, price, category) VALUES
('Room Service Breakfast', 'Continental breakfast delivered to room', 800, 'food'),
('Spa Massage', '60-minute relaxation massage', 2500, 'service'),
('Adventure Trek', 'Guided nature trek with equipment', 1500, 'activity'),
('Welcome Drink', 'Fresh fruit juice or mocktail', 200, 'beverage'),
('Laundry Service', 'Same-day laundry and pressing', 300, 'service'),
('Bonfire Setup', 'Private bonfire with snacks', 1200, 'activity');
