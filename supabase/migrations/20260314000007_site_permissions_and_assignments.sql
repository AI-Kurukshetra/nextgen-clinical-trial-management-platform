-- Site-level permission model and subject assignment workflows

create table if not exists public.site_members (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner', 'admin', 'coordinator', 'nurse', 'investigator', 'viewer')),
  permission_mask integer not null default 0,
  invited_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  unique(site_id, user_id)
);

create table if not exists public.subject_assignments (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references public.subjects(id) on delete cascade,
  assignee_user_id uuid not null references auth.users(id) on delete cascade,
  assigned_by uuid references auth.users(id),
  assignment_role text not null default 'nurse',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(subject_id, assignee_user_id)
);

create index if not exists idx_site_members_site_id on public.site_members(site_id);
create index if not exists idx_site_members_user_id on public.site_members(user_id);
create index if not exists idx_subject_assignments_subject_id on public.subject_assignments(subject_id);
create index if not exists idx_subject_assignments_user_id on public.subject_assignments(assignee_user_id);

drop trigger if exists set_subject_assignments_updated_at on public.subject_assignments;
create trigger set_subject_assignments_updated_at
  before update on public.subject_assignments
  for each row execute function public.set_updated_at();
