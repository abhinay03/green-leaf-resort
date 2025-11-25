-- ================================================================
-- COMPLETE ADMIN SYSTEM SETUP FOR GREEN LEAF RESORT
-- Run this entire script in Supabase SQL Editor
-- ================================================================

-- ================================================================
-- STEP 1: Clean up existing admin_users table and policies
-- ================================================================

-- Drop all existing policies
DROP POLICY IF EXISTS "authenticated_can_check_admin_status" ON admin_users;
DROP POLICY IF EXISTS "anon_can_check_admin" ON admin_users;
DROP POLICY IF EXISTS "admins_can_manage" ON admin_users;
DROP POLICY IF EXISTS "admin_users_select" ON admin_users;
DROP POLICY IF EXISTS "admin_users_select_admin" ON admin_users;
DROP POLICY IF EXISTS "admin_users_admin_only" ON admin_users;
DROP POLICY IF EXISTS "admin_users_manage" ON admin_users;
DROP POLICY IF EXISTS "allow_read_admin_users" ON admin_users;

-- Disable RLS temporarily to clean up
ALTER TABLE public.admin_users DISABLE ROW LEVEL SECURITY;

-- Clear existing admin users (start fresh)
-- Use CASCADE to handle foreign key constraints
TRUNCATE TABLE public.admin_users CASCADE;

-- ================================================================
-- STEP 2: Ensure admin_users table has correct structure
-- ================================================================

-- Create table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.admin_users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  role text not null default 'admin',
  permissions text[] default ARRAY[]::text[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add missing columns if they don't exist
DO $$ 
BEGIN
  -- Add is_active column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'admin_users' 
    AND column_name = 'is_active'
  ) THEN
    ALTER TABLE public.admin_users ADD COLUMN is_active boolean default true;
  END IF;
END $$;

-- Add CHECK constraint for role if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'admin_users_role_check'
  ) THEN
    ALTER TABLE public.admin_users 
    ADD CONSTRAINT admin_users_role_check 
    CHECK (role IN ('super_admin', 'admin'));
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_role ON admin_users(role);

-- ================================================================
-- STEP 3: Set up proper permissions (no RLS, just table grants)
-- ================================================================

-- Grant SELECT to everyone (needed to check admin status)
GRANT SELECT ON public.admin_users TO anon;
GRANT SELECT ON public.admin_users TO authenticated;

-- Only postgres role can INSERT/UPDATE/DELETE (via SQL editor only)
REVOKE INSERT, UPDATE, DELETE ON public.admin_users FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.admin_users FROM authenticated;

-- Keep RLS disabled - admin_users is just for role checking
ALTER TABLE public.admin_users DISABLE ROW LEVEL SECURITY;

-- ================================================================
-- STEP 4: Create test admin users
-- ================================================================

-- First, we need to create users in Supabase Auth
-- Since we can't create auth users via SQL, we'll prepare the INSERT statements

-- IMPORTANT: You need to create these users in Supabase Dashboard first:
-- 1. Go to Authentication → Users → Add User
-- 2. Create two users with these details:

-- USER 1 - SUPER ADMIN (YOU)
-- Email: admin@thegreenleafresorts.com
-- Password: GreenLeaf2024!Admin
-- Auto Confirm: YES

-- USER 2 - REGULAR ADMIN (STAFF)
-- Email: manager@thegreenleafresorts.com  
-- Password: Manager2024!Staff
-- Auto Confirm: YES

-- After creating the users in Supabase Auth, run this to auto-promote them:

DO $$
DECLARE
  super_admin_id uuid;
  manager_id uuid;
BEGIN
  -- Get the user IDs from auth.users
  SELECT id INTO super_admin_id 
  FROM auth.users 
  WHERE email = 'admin@thegreenleafresorts.com' 
  LIMIT 1;
  
  SELECT id INTO manager_id 
  FROM auth.users 
  WHERE email = 'manager@thegreenleafresorts.com' 
  LIMIT 1;
  
  -- Insert super admin
  IF super_admin_id IS NOT NULL THEN
    INSERT INTO public.admin_users (id, email, role, permissions, is_active)
    VALUES (
      super_admin_id,
      'admin@thegreenleafresorts.com',
      'super_admin',
      ARRAY['manage_bookings', 'manage_accommodations', 'manage_packages', 'manage_users', 'view_analytics', 'manage_finances', 'manage_admins'],
      true
    )
    ON CONFLICT (id) DO UPDATE 
    SET role = 'super_admin',
        permissions = ARRAY['manage_bookings', 'manage_accommodations', 'manage_packages', 'manage_users', 'view_analytics', 'manage_finances', 'manage_admins'],
        is_active = true;
    
    RAISE NOTICE 'Super Admin created: admin@thegreenleafresorts.com';
  ELSE
    RAISE NOTICE 'User not found: admin@thegreenleafresorts.com - Create in Auth first!';
  END IF;
  
  -- Insert regular admin/manager
  IF manager_id IS NOT NULL THEN
    INSERT INTO public.admin_users (id, email, role, permissions, is_active)
    VALUES (
      manager_id,
      'manager@thegreenleafresorts.com',
      'admin',
      ARRAY['manage_bookings', 'view_analytics', 'manage_accommodations'],
      true
    )
    ON CONFLICT (id) DO UPDATE 
    SET role = 'admin',
        permissions = ARRAY['manage_bookings', 'view_analytics', 'manage_accommodations'],
        is_active = true;
    
    RAISE NOTICE 'Manager Admin created: manager@thegreenleafresorts.com';
  ELSE
    RAISE NOTICE 'User not found: manager@thegreenleafresorts.com - Create in Auth first!';
  END IF;
END $$;

-- ================================================================
-- STEP 5: Create helper functions for admin checks
-- ================================================================

-- Function to check if user is any admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_users
    WHERE id = user_id AND is_active = true
  );
$$;

-- Function to check if user is super admin
CREATE OR REPLACE FUNCTION public.is_super_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_users
    WHERE id = user_id AND role = 'super_admin' AND is_active = true
  );
$$;

-- Function to check if user has specific permission
CREATE OR REPLACE FUNCTION public.has_permission(user_id uuid, permission_name text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_users
    WHERE id = user_id 
    AND is_active = true
    AND (
      role = 'super_admin' 
      OR permission_name = ANY(permissions)
    )
  );
$$;

-- ================================================================
-- STEP 6: Verify setup
-- ================================================================

-- Show all admin users
SELECT 
  u.email,
  a.role,
  a.permissions,
  a.is_active,
  a.created_at
FROM auth.users u
JOIN admin_users a ON u.id = a.id
ORDER BY a.role DESC, u.email;

-- Verify functions work
DO $$
DECLARE
  test_user_id uuid;
BEGIN
  SELECT id INTO test_user_id FROM auth.users WHERE email = 'admin@thegreenleafresorts.com' LIMIT 1;
  
  IF test_user_id IS NOT NULL THEN
    RAISE NOTICE 'Testing admin functions for admin@thegreenleafresorts.com:';
    RAISE NOTICE '  is_admin: %', public.is_admin(test_user_id);
    RAISE NOTICE '  is_super_admin: %', public.is_super_admin(test_user_id);
    RAISE NOTICE '  has_permission(manage_bookings): %', public.has_permission(test_user_id, 'manage_bookings');
  END IF;
END $$;

-- ================================================================
-- STEP 7: Success message
-- ================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '════════════════════════════════════════════════════════════';
  RAISE NOTICE '✅ ADMIN SYSTEM SETUP COMPLETE!';
  RAISE NOTICE '════════════════════════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE '📋 TEST CREDENTIALS:';
  RAISE NOTICE '';
  RAISE NOTICE '1. SUPER ADMIN (Full Access):';
  RAISE NOTICE '   Email: admin@thegreenleafresorts.com';
  RAISE NOTICE '   Password: GreenLeaf2024!Admin';
  RAISE NOTICE '   Role: super_admin';
  RAISE NOTICE '';
  RAISE NOTICE '2. REGULAR ADMIN (Limited Access):';
  RAISE NOTICE '   Email: manager@thegreenleafresorts.com';
  RAISE NOTICE '   Password: Manager2024!Staff';
  RAISE NOTICE '   Role: admin';
  RAISE NOTICE '   Permissions: manage_bookings, view_analytics, manage_accommodations';
  RAISE NOTICE '';
  RAISE NOTICE '🔐 IMPORTANT:';
  RAISE NOTICE '   - Create these users in Supabase Dashboard → Auth → Users first!';
  RAISE NOTICE '   - Then run this script to promote them to admins';
  RAISE NOTICE '   - Change passwords after first login';
  RAISE NOTICE '';
  RAISE NOTICE '🌐 LOGIN URL:';
  RAISE NOTICE '   http://localhost:3000/admin/login';
  RAISE NOTICE '   OR';
  RAISE NOTICE '   https://your-domain.com/admin/login';
  RAISE NOTICE '';
  RAISE NOTICE '════════════════════════════════════════════════════════════';
END $$;
