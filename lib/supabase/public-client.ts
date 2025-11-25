import { createClient } from '@supabase/supabase-js';

// This client is for public API routes that don't require authentication
// Updated: 2025-11-25 - Fixed permissions
export const supabasePublic = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  }
);
