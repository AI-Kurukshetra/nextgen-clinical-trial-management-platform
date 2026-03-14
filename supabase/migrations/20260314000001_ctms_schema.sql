-- Sprint 0 foundational CTMS schema.
-- This migration intentionally preserves Supabase Auth and existing auth triggers.

-- Reusable trigger function for updated_at fields.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Keep profile role constraints aligned with CTMS RBAC.
alter table public.profiles
  drop constraint if exists profiles_role_check;
alter table public.profiles
  add constraint profiles_role_check
  check (role in ('admin', 'study_manager', 'monitor', 'site_coordinator', 'viewer'));

alter table public.profiles
  alter column role set default 'viewer';

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Keep signup trigger behavior, but enforce CTMS default role.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url',
    'viewer'
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = coalesce(excluded.full_name, public.profiles.full_name),
    avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Clean stale demo table.
drop table if exists public.items cascade;

create table if not exists public.studies (
  id uuid primary key default gen_random_uuid(),
  protocol_number text not null unique,
  title text not null,
  phase text not null check (phase in ('Phase I', 'Phase II', 'Phase III', 'Phase IV', 'Observational')),
  status text not null default 'setup' check (status in ('setup', 'active', 'on_hold', 'completed', 'terminated')),
  therapeutic_area text,
  sponsor_name text,
  indication text,
  target_enrollment integer,
  planned_start_date date,
  planned_end_date date,
  actual_start_date date,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.study_team (
  id uuid primary key default gen_random_uuid(),
  study_id uuid not null references public.studies(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('study_manager', 'monitor', 'site_coordinator', 'viewer')),
  created_at timestamptz not null default now(),
  unique(study_id, user_id)
);

create table if not exists public.sites (
  id uuid primary key default gen_random_uuid(),
  study_id uuid not null references public.studies(id) on delete cascade,
  site_number text not null,
  name text not null,
  city text,
  country text not null default 'US',
  status text not null default 'identified' check (status in ('identified', 'selected', 'initiated', 'active', 'closed', 'terminated')),
  principal_investigator_name text,
  principal_investigator_email text,
  target_enrollment integer default 0,
  enrolled_count integer not null default 0,
  screen_failures integer not null default 0,
  initiated_date date,
  closed_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(study_id, site_number)
);

create table if not exists public.subjects (
  id uuid primary key default gen_random_uuid(),
  study_id uuid not null references public.studies(id) on delete cascade,
  site_id uuid not null references public.sites(id) on delete cascade,
  subject_number text not null,
  initials text,
  status text not null default 'screened' check (status in ('screened', 'enrolled', 'active', 'completed', 'withdrawn', 'screen_failed', 'lost_to_followup')),
  screen_date date,
  enrollment_date date,
  completion_date date,
  withdrawal_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(study_id, subject_number)
);

create table if not exists public.monitoring_visits (
  id uuid primary key default gen_random_uuid(),
  study_id uuid not null references public.studies(id) on delete cascade,
  site_id uuid not null references public.sites(id) on delete cascade,
  monitor_id uuid references auth.users(id),
  visit_type text not null check (visit_type in ('SIV', 'IMV', 'COV', 'Remote', 'For_Cause')),
  status text not null default 'scheduled' check (status in ('scheduled', 'in_progress', 'completed', 'cancelled')),
  planned_date date not null,
  actual_date date,
  subjects_reviewed integer default 0,
  findings_summary text,
  report_due_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.deviations (
  id uuid primary key default gen_random_uuid(),
  study_id uuid not null references public.studies(id) on delete cascade,
  site_id uuid not null references public.sites(id) on delete cascade,
  subject_id uuid references public.subjects(id) on delete set null,
  deviation_number text not null,
  category text not null check (category in ('protocol', 'gcp', 'informed_consent', 'ip_handling', 'eligibility', 'visit_window', 'other')),
  description text not null,
  severity text not null default 'minor' check (severity in ('minor', 'major', 'critical')),
  status text not null default 'open' check (status in ('open', 'under_review', 'resolved', 'closed')),
  reported_date date not null default current_date,
  resolved_date date,
  root_cause text,
  corrective_action text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.milestones (
  id uuid primary key default gen_random_uuid(),
  study_id uuid not null references public.studies(id) on delete cascade,
  name text not null,
  planned_date date,
  actual_date date,
  status text not null default 'pending' check (status in ('pending', 'at_risk', 'completed', 'missed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  study_id uuid not null references public.studies(id) on delete cascade,
  site_id uuid references public.sites(id) on delete cascade,
  name text not null,
  doc_type text not null check (doc_type in ('protocol', 'icf', 'investigator_brochure', 'regulatory_submission', 'monitoring_report', 'deviation_report', 'other')),
  version text not null default '1.0',
  status text not null default 'draft' check (status in ('draft', 'under_review', 'approved', 'superseded')),
  file_url text,
  file_size bigint,
  file_mime text,
  s3_key text,
  uploaded_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id bigserial primary key,
  table_name text not null,
  record_id uuid,
  action text not null check (action in ('INSERT', 'UPDATE', 'DELETE')),
  old_data jsonb,
  new_data jsonb,
  performed_by uuid references auth.users(id),
  performed_at timestamptz not null default now()
);

create index if not exists idx_study_team_user_id on public.study_team(user_id);
create index if not exists idx_study_team_study_id on public.study_team(study_id);
create index if not exists idx_sites_study_id on public.sites(study_id);
create index if not exists idx_subjects_study_id on public.subjects(study_id);
create index if not exists idx_subjects_site_id on public.subjects(site_id);
create index if not exists idx_monitoring_visits_study_id on public.monitoring_visits(study_id);
create index if not exists idx_monitoring_visits_monitor on public.monitoring_visits(monitor_id);
create index if not exists idx_deviations_study_id on public.deviations(study_id);
create index if not exists idx_milestones_study_id on public.milestones(study_id);
create index if not exists idx_documents_study_id on public.documents(study_id);
create index if not exists idx_audit_logs_table_record on public.audit_logs(table_name, record_id);
create index if not exists idx_audit_logs_performed_by on public.audit_logs(performed_by);

drop trigger if exists set_studies_updated_at on public.studies;
create trigger set_studies_updated_at before update on public.studies for each row execute function public.set_updated_at();
drop trigger if exists set_sites_updated_at on public.sites;
create trigger set_sites_updated_at before update on public.sites for each row execute function public.set_updated_at();
drop trigger if exists set_subjects_updated_at on public.subjects;
create trigger set_subjects_updated_at before update on public.subjects for each row execute function public.set_updated_at();
drop trigger if exists set_monitoring_visits_updated_at on public.monitoring_visits;
create trigger set_monitoring_visits_updated_at before update on public.monitoring_visits for each row execute function public.set_updated_at();
drop trigger if exists set_deviations_updated_at on public.deviations;
create trigger set_deviations_updated_at before update on public.deviations for each row execute function public.set_updated_at();
drop trigger if exists set_milestones_updated_at on public.milestones;
create trigger set_milestones_updated_at before update on public.milestones for each row execute function public.set_updated_at();
drop trigger if exists set_documents_updated_at on public.documents;
create trigger set_documents_updated_at before update on public.documents for each row execute function public.set_updated_at();

create or replace function public.sync_site_enrollment()
returns trigger
language plpgsql
as $$
begin
  update public.sites
  set
    enrolled_count = (
      select count(*)
      from public.subjects
      where site_id = new.site_id and status not in ('screened', 'screen_failed')
    ),
    screen_failures = (
      select count(*)
      from public.subjects
      where site_id = new.site_id and status = 'screen_failed'
    )
  where id = new.site_id;
  return new;
end;
$$;

drop trigger if exists sync_enrollment_on_subject_change on public.subjects;
create trigger sync_enrollment_on_subject_change
  after insert or update of status on public.subjects
  for each row execute function public.sync_site_enrollment();

create or replace function public.is_study_manager_for_study(target_study_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from public.study_team
    where study_id = target_study_id
      and user_id = auth.uid()
      and role = 'study_manager'
  );
$$;

revoke all on function public.is_study_manager_for_study(uuid) from public;
grant execute on function public.is_study_manager_for_study(uuid) to authenticated;

alter table public.studies disable row level security;
alter table public.study_team disable row level security;
alter table public.sites disable row level security;
alter table public.subjects disable row level security;
alter table public.monitoring_visits disable row level security;
alter table public.deviations disable row level security;
alter table public.milestones disable row level security;
alter table public.documents disable row level security;
alter table public.audit_logs disable row level security;
alter table public.profiles disable row level security;

drop policy if exists "Admins full access to studies" on public.studies;
create policy "Admins full access to studies"
  on public.studies for all to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

drop policy if exists "Study team can view studies" on public.studies;
create policy "Study team can view studies"
  on public.studies for select to authenticated
  using (
    created_by = auth.uid() or
    exists (select 1 from public.study_team where study_team.study_id = studies.id and study_team.user_id = auth.uid())
  );

drop policy if exists "Study managers can create studies" on public.studies;
create policy "Study managers can create studies"
  on public.studies for insert to authenticated
  with check (exists (
    select 1
    from public.profiles
    where id = auth.uid() and role in ('admin', 'study_manager', 'viewer')
  ));

drop policy if exists "Study managers can update studies" on public.studies;
create policy "Study managers can update studies"
  on public.studies for update to authenticated
  using (exists (
    select 1 from public.study_team
    where study_team.study_id = studies.id and study_team.user_id = auth.uid() and study_team.role = 'study_manager'
  ));

drop policy if exists "Admins manage study team" on public.study_team;
create policy "Admins manage study team"
  on public.study_team for all to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

drop policy if exists "Users view own membership" on public.study_team;
create policy "Users view own membership"
  on public.study_team for select to authenticated
  using (user_id = auth.uid());

drop policy if exists "Creators can add self as manager" on public.study_team;
create policy "Creators can add self as manager"
  on public.study_team for insert to authenticated
  with check (
    user_id = auth.uid() and role = 'study_manager' and
    exists (select 1 from public.studies where studies.id = study_team.study_id and studies.created_by = auth.uid())
  );

drop policy if exists "Managers manage study team" on public.study_team;
create policy "Managers manage study team"
  on public.study_team for all to authenticated
  using (public.is_study_manager_for_study(study_team.study_id))
  with check (public.is_study_manager_for_study(study_team.study_id));

drop policy if exists "Admins manage all sites" on public.sites;
create policy "Admins manage all sites"
  on public.sites for all to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

drop policy if exists "Study team can view sites" on public.sites;
create policy "Study team can view sites"
  on public.sites for select to authenticated
  using (exists (select 1 from public.study_team where study_team.study_id = sites.study_id and study_team.user_id = auth.uid()));

drop policy if exists "Managers can manage sites" on public.sites;
create policy "Managers can manage sites"
  on public.sites for all to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'study_manager')));

drop policy if exists "Admins manage all subjects" on public.subjects;
create policy "Admins manage all subjects"
  on public.subjects for all to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

drop policy if exists "Study team can view subjects" on public.subjects;
create policy "Study team can view subjects"
  on public.subjects for select to authenticated
  using (exists (select 1 from public.study_team where study_team.study_id = subjects.study_id and study_team.user_id = auth.uid()));

drop policy if exists "Clinical roles can manage subjects" on public.subjects;
create policy "Clinical roles can manage subjects"
  on public.subjects for all to authenticated
  using (exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin', 'study_manager', 'monitor', 'site_coordinator')
  ));

drop policy if exists "Admins manage visits" on public.monitoring_visits;
create policy "Admins manage visits"
  on public.monitoring_visits for all to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

drop policy if exists "Study team view visits" on public.monitoring_visits;
create policy "Study team view visits"
  on public.monitoring_visits for select to authenticated
  using (exists (select 1 from public.study_team where study_team.study_id = monitoring_visits.study_id and study_team.user_id = auth.uid()));

drop policy if exists "Monitors manage visits" on public.monitoring_visits;
create policy "Monitors manage visits"
  on public.monitoring_visits for all to authenticated
  using (exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin', 'study_manager', 'monitor')
  ));

drop policy if exists "Admins manage deviations" on public.deviations;
create policy "Admins manage deviations"
  on public.deviations for all to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

drop policy if exists "Study team view deviations" on public.deviations;
create policy "Study team view deviations"
  on public.deviations for select to authenticated
  using (exists (select 1 from public.study_team where study_team.study_id = deviations.study_id and study_team.user_id = auth.uid()));

drop policy if exists "Clinical roles manage deviations" on public.deviations;
create policy "Clinical roles manage deviations"
  on public.deviations for all to authenticated
  using (exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin', 'study_manager', 'monitor', 'site_coordinator')
  ));

drop policy if exists "Admins manage milestones" on public.milestones;
create policy "Admins manage milestones"
  on public.milestones for all to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

drop policy if exists "Study team view milestones" on public.milestones;
create policy "Study team view milestones"
  on public.milestones for select to authenticated
  using (exists (select 1 from public.study_team st where st.study_id = milestones.study_id and st.user_id = auth.uid()));

drop policy if exists "Managers manage milestones" on public.milestones;
create policy "Managers manage milestones"
  on public.milestones for all to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'study_manager')));

drop policy if exists "Admins manage documents" on public.documents;
create policy "Admins manage documents"
  on public.documents for all to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

drop policy if exists "Study team view documents" on public.documents;
create policy "Study team view documents"
  on public.documents for select to authenticated
  using (exists (select 1 from public.study_team st where st.study_id = documents.study_id and st.user_id = auth.uid()));

drop policy if exists "Clinical roles manage documents" on public.documents;
create policy "Clinical roles manage documents"
  on public.documents for all to authenticated
  using (exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin', 'study_manager', 'monitor')
  ));

drop policy if exists "Admins view audit logs" on public.audit_logs;
create policy "Admins view audit logs"
  on public.audit_logs for select to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
