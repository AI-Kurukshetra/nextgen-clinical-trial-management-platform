-- Backfill profiles for any existing auth users created before handle_new_user ran.
-- Safe to run multiple times.

insert into public.profiles (id, email, full_name, avatar_url, role)
select
  u.id,
  u.email,
  coalesce(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name', split_part(u.email, '@', 1)),
  u.raw_user_meta_data->>'avatar_url',
  'viewer'
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null
on conflict (id) do nothing;
