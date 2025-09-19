-- Create packages table for service packages
create table if not exists public.packages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price decimal(10,2) not null,
  duration_days integer default 1,
  includes text[], -- array of included services
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.packages enable row level security;

-- Allow everyone to read packages (public data)
create policy "packages_select_all"
  on public.packages for select
  using (true);

-- Only authenticated users can modify (admin functionality)
create policy "packages_admin_only"
  on public.packages for all
  using (auth.uid() is not null);
