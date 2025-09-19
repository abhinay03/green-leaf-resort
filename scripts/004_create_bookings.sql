-- Create bookings table for reservations
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  accommodation_id uuid references public.accommodations(id),
  package_id uuid references public.packages(id),
  check_in_date date not null,
  check_out_date date not null,
  guests integer not null default 2,
  total_amount decimal(10,2) not null,
  status text default 'pending', -- 'pending', 'confirmed', 'cancelled', 'completed'
  special_requests text,
  guest_name text not null,
  guest_email text not null,
  guest_phone text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  -- Offline sync fields
  synced boolean default false,
  offline_id text unique -- for offline bookings
);

alter table public.bookings enable row level security;

-- Users can view their own bookings
create policy "bookings_select_own"
  on public.bookings for select
  using (auth.uid() = user_id);

-- Users can create bookings
create policy "bookings_insert_own"
  on public.bookings for insert
  with check (auth.uid() = user_id);

-- Users can update their own bookings
create policy "bookings_update_own"
  on public.bookings for update
  using (auth.uid() = user_id);

-- Admin can view all bookings (we'll handle admin role separately)
create policy "bookings_admin_select_all"
  on public.bookings for select
  using (auth.uid() is not null);

create policy "bookings_admin_update_all"
  on public.bookings for update
  using (auth.uid() is not null);
