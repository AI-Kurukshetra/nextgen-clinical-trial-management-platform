-- Profiles: extended user data with role (admin | user)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  role text not null default 'user' check (role in ('admin', 'user')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Demo entity: items (generic starter content)
create table if not exists public.items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  created_by uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes
create index if not exists idx_items_created_by on public.items (created_by);
create index if not exists idx_profiles_role on public.profiles (role);

-- RLS
alter table public.profiles enable row level security;
alter table public.items enable row level security;

-- Profiles: users can read all profiles (for display), update only own
create policy "Profiles are viewable by authenticated users"
  on public.profiles for select
  to authenticated
  using (true);

create policy "Users can update own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

-- Items: users can read all; only own insert; admin can do everything
create policy "Items are viewable by authenticated users"
  on public.items for select
  to authenticated
  using (true);

create policy "Authenticated users can create items"
  on public.items for insert
  to authenticated
  with check (auth.uid() = created_by);

create policy "Users can update own items"
  on public.items for update
  to authenticated
  using (auth.uid() = created_by)
  with check (auth.uid() = created_by);

create policy "Users can delete own items"
  on public.items for delete
  to authenticated
  using (auth.uid() = created_by);

-- Admins can do everything on items (bypass by checking profile.role in app or add policy)
-- We use a policy that allows update/delete if user is admin (via profiles.role)
create policy "Admins can update any item"
  on public.items for update
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

create policy "Admins can delete any item"
  on public.items for delete
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

-- Trigger: create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url',
    'user'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Optional: update updated_at
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists set_items_updated_at on public.items;
create trigger set_items_updated_at
  before update on public.items
  for each row execute function public.set_updated_at();
