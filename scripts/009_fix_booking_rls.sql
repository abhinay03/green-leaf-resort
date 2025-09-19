-- Fix RLS policy to allow guest bookings without user_id
DROP POLICY IF EXISTS "Users can create bookings" ON bookings;
DROP POLICY IF EXISTS "Users can view their bookings" ON bookings;
DROP POLICY IF EXISTS "Admin can manage all bookings" ON bookings;

-- Allow anyone to create bookings (for guest bookings)
CREATE POLICY "Anyone can create bookings" ON bookings
  FOR INSERT WITH CHECK (true);

-- Allow users to view their own bookings or guest bookings
CREATE POLICY "Users can view bookings" ON bookings
  FOR SELECT USING (
    auth.uid() = user_id OR 
    user_id IS NULL OR
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Allow admins to manage all bookings
CREATE POLICY "Admin can manage all bookings" ON bookings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );
