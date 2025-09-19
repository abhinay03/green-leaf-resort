-- Create a demo admin user
-- First, you need to sign up this user through Supabase Auth, then run this script

-- Insert admin user (replace with actual user ID after signup)
-- This is just a placeholder - you'll need to replace the ID with the actual user ID from auth.users
INSERT INTO public.admin_users (id, role, permissions) 
VALUES (
  '00000000-0000-0000-0000-000000000000', -- Replace with actual user ID
  'super_admin',
  ARRAY['manage_bookings', 'manage_accommodations', 'manage_users', 'view_analytics']
) ON CONFLICT (id) DO NOTHING;

-- Note: To create an actual admin user:
-- 1. Sign up at /admin/login with email: admin@thegreenleafresorts.com, password: admin123
-- 2. Get the user ID from auth.users table
-- 3. Update this script with the actual user ID
-- 4. Run this script to grant admin permissions
