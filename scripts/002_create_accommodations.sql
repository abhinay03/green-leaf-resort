-- Create accommodations table for different room types
create table if not exists public.accommodations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null, -- 'luxury_cottage', 'swiss_tent', 'glamping_tent'
  description text,
  capacity integer not null default 2,
  price_per_night decimal(10,2) not null,
  amenities text[], -- array of amenities
  images text[], -- array of image URLs
  is_available boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.accommodations enable row level security;

-- Allow everyone to read accommodations (public data)
create policy "accommodations_select_all"
  on public.accommodations for select
  using (true);

-- Only authenticated users can modify (admin functionality)
create policy "accommodations_admin_only"
  on public.accommodations for all
  using (auth.uid() is not null);
