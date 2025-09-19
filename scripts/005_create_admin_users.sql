-- Create admin_users table for admin access
create table if not exists public.admin_users (
  id uuid primary key references auth.users(id) on delete cascade,
  role text default 'admin', -- 'admin', 'super_admin'
  permissions text[], -- array of permissions
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.admin_users enable row level security;

-- Only admin users can access this table
create policy "admin_users_select_admin"
  on public.admin_users for select
  using (auth.uid() in (select id from public.admin_users));

create policy "admin_users_admin_only"
  on public.admin_users for all
  using (auth.uid() in (select id from public.admin_users where role = 'super_admin'));
