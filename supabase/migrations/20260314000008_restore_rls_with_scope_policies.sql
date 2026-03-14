-- Restore RLS with scoped access policies for core CTMS tables.
-- This replaces the temporary "disable all RLS" hotfix.

set check_function_bodies = off;

create or replace function public.current_role()
returns text
language sql
security definer
stable
set search_path = public
as $$
  select role
  from public.profiles
  where id = auth.uid()
$$;

create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select coalesce(public.current_role() = 'admin', false)
$$;

create or replace function public.is_study_manager()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select coalesce(public.current_role() = 'study_manager', false)
$$;

create or replace function public.is_admin_or_study_manager()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select public.is_admin() or public.is_study_manager()
$$;

create or replace function public.can_access_study(target_study_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select
    public.is_admin_or_study_manager()
    or exists (
      select 1
      from public.study_team st
      where st.study_id = target_study_id
        and st.user_id = auth.uid()
    )
    or exists (
      select 1
      from public.sites s
      join public.site_members sm on sm.site_id = s.id
      where s.study_id = target_study_id
        and sm.user_id = auth.uid()
    )
$$;

create or replace function public.can_access_site(target_site_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select
    public.is_admin_or_study_manager()
    or exists (
      select 1
      from public.site_members sm
      where sm.site_id = target_site_id
        and sm.user_id = auth.uid()
    )
    or exists (
      select 1
      from public.sites s
      join public.study_team st on st.study_id = s.study_id
      where s.id = target_site_id
        and st.user_id = auth.uid()
    )
$$;

create or replace function public.can_manage_site(target_site_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select
    public.is_admin_or_study_manager()
    or exists (
      select 1
      from public.site_members sm
      where sm.site_id = target_site_id
        and sm.user_id = auth.uid()
        and (
          sm.role in ('owner', 'admin')
          or (sm.permission_mask & (1 << 0)) = (1 << 0)
        )
    )
$$;

create or replace function public.can_manage_site_members(target_site_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select
    public.is_admin_or_study_manager()
    or exists (
      select 1
      from public.site_members sm
      where sm.site_id = target_site_id
        and sm.user_id = auth.uid()
        and (
          sm.role in ('owner', 'admin')
          or (sm.permission_mask & (1 << 1)) = (1 << 1)
        )
    )
$$;

create or replace function public.can_create_subject(target_site_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select
    public.is_admin_or_study_manager()
    or exists (
      select 1
      from public.site_members sm
      where sm.site_id = target_site_id
        and sm.user_id = auth.uid()
        and (sm.permission_mask & (1 << 2)) = (1 << 2)
    )
$$;

create or replace function public.can_update_subject(target_site_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select
    public.is_admin_or_study_manager()
    or exists (
      select 1
      from public.site_members sm
      where sm.site_id = target_site_id
        and sm.user_id = auth.uid()
        and (sm.permission_mask & (1 << 3)) = (1 << 3)
    )
$$;

create or replace function public.can_assign_subject(target_site_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select
    public.is_admin_or_study_manager()
    or exists (
      select 1
      from public.site_members sm
      where sm.site_id = target_site_id
        and sm.user_id = auth.uid()
        and (sm.permission_mask & (1 << 4)) = (1 << 4)
    )
$$;

-- Profiles
alter table if exists public.profiles enable row level security;
drop policy if exists "profiles self select" on public.profiles;
create policy "profiles self select" on public.profiles for select to authenticated
  using (id = auth.uid() or public.is_admin());
drop policy if exists "profiles self update" on public.profiles;
create policy "profiles self update" on public.profiles for update to authenticated
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

-- Core study hierarchy
alter table if exists public.studies enable row level security;
drop policy if exists "studies select scoped" on public.studies;
create policy "studies select scoped" on public.studies for select to authenticated
  using (public.can_access_study(id));
drop policy if exists "studies write manager" on public.studies;
create policy "studies write manager" on public.studies for all to authenticated
  using (public.is_admin_or_study_manager())
  with check (public.is_admin_or_study_manager());

alter table if exists public.study_team enable row level security;
drop policy if exists "study_team select scoped" on public.study_team;
create policy "study_team select scoped" on public.study_team for select to authenticated
  using (public.can_access_study(study_id));
drop policy if exists "study_team write manager" on public.study_team;
create policy "study_team write manager" on public.study_team for all to authenticated
  using (public.is_admin_or_study_manager())
  with check (public.is_admin_or_study_manager());

alter table if exists public.sites enable row level security;
drop policy if exists "sites select scoped" on public.sites;
create policy "sites select scoped" on public.sites for select to authenticated
  using (public.can_access_site(id));
drop policy if exists "sites write scoped" on public.sites;
create policy "sites write scoped" on public.sites for all to authenticated
  using (public.can_manage_site(id))
  with check (public.can_manage_site(id));

alter table if exists public.subjects enable row level security;
drop policy if exists "subjects select scoped" on public.subjects;
create policy "subjects select scoped" on public.subjects for select to authenticated
  using (public.can_access_site(site_id));
drop policy if exists "subjects insert scoped" on public.subjects;
create policy "subjects insert scoped" on public.subjects for insert to authenticated
  with check (public.can_create_subject(site_id));
drop policy if exists "subjects update scoped" on public.subjects;
create policy "subjects update scoped" on public.subjects for update to authenticated
  using (public.can_update_subject(site_id))
  with check (public.can_update_subject(site_id));

alter table if exists public.monitoring_visits enable row level security;
drop policy if exists "monitoring select scoped" on public.monitoring_visits;
create policy "monitoring select scoped" on public.monitoring_visits for select to authenticated
  using (public.can_access_site(site_id));
drop policy if exists "monitoring write scoped" on public.monitoring_visits;
create policy "monitoring write scoped" on public.monitoring_visits for all to authenticated
  using (public.can_manage_site(site_id))
  with check (public.can_manage_site(site_id));

alter table if exists public.deviations enable row level security;
drop policy if exists "deviations select scoped" on public.deviations;
create policy "deviations select scoped" on public.deviations for select to authenticated
  using (public.can_access_site(site_id));
drop policy if exists "deviations write scoped" on public.deviations;
create policy "deviations write scoped" on public.deviations for all to authenticated
  using (public.can_manage_site(site_id))
  with check (public.can_manage_site(site_id));

alter table if exists public.milestones enable row level security;
drop policy if exists "milestones select scoped" on public.milestones;
create policy "milestones select scoped" on public.milestones for select to authenticated
  using (public.can_access_study(study_id));
drop policy if exists "milestones write scoped" on public.milestones;
create policy "milestones write scoped" on public.milestones for all to authenticated
  using (public.is_admin_or_study_manager())
  with check (public.is_admin_or_study_manager());

alter table if exists public.documents enable row level security;
drop policy if exists "documents select scoped" on public.documents;
create policy "documents select scoped" on public.documents for select to authenticated
  using (
    case
      when site_id is not null then public.can_access_site(site_id)
      else public.can_access_study(study_id)
    end
  );
drop policy if exists "documents write scoped" on public.documents;
create policy "documents write scoped" on public.documents for all to authenticated
  using (
    case
      when site_id is not null then public.can_manage_site(site_id)
      else public.is_admin_or_study_manager()
    end
  )
  with check (
    case
      when site_id is not null then public.can_manage_site(site_id)
      else public.is_admin_or_study_manager()
    end
  );

-- Protocol entities (study scoped)
alter table if exists public.protocol_objectives enable row level security;
drop policy if exists "protocol_objectives select scoped" on public.protocol_objectives;
create policy "protocol_objectives select scoped" on public.protocol_objectives for select to authenticated
  using (public.can_access_study(study_id));
drop policy if exists "protocol_objectives write scoped" on public.protocol_objectives;
create policy "protocol_objectives write scoped" on public.protocol_objectives for all to authenticated
  using (public.is_admin_or_study_manager())
  with check (public.is_admin_or_study_manager());

alter table if exists public.eligibility_criteria enable row level security;
drop policy if exists "eligibility_criteria select scoped" on public.eligibility_criteria;
create policy "eligibility_criteria select scoped" on public.eligibility_criteria for select to authenticated
  using (public.can_access_study(study_id));
drop policy if exists "eligibility_criteria write scoped" on public.eligibility_criteria;
create policy "eligibility_criteria write scoped" on public.eligibility_criteria for all to authenticated
  using (public.is_admin_or_study_manager())
  with check (public.is_admin_or_study_manager());

alter table if exists public.study_arms enable row level security;
drop policy if exists "study_arms select scoped" on public.study_arms;
create policy "study_arms select scoped" on public.study_arms for select to authenticated
  using (public.can_access_study(study_id));
drop policy if exists "study_arms write scoped" on public.study_arms;
create policy "study_arms write scoped" on public.study_arms for all to authenticated
  using (public.is_admin_or_study_manager())
  with check (public.is_admin_or_study_manager());

alter table if exists public.visit_definitions enable row level security;
drop policy if exists "visit_definitions select scoped" on public.visit_definitions;
create policy "visit_definitions select scoped" on public.visit_definitions for select to authenticated
  using (public.can_access_study(study_id));
drop policy if exists "visit_definitions write scoped" on public.visit_definitions;
create policy "visit_definitions write scoped" on public.visit_definitions for all to authenticated
  using (public.is_admin_or_study_manager())
  with check (public.is_admin_or_study_manager());

alter table if exists public.protocol_endpoints enable row level security;
drop policy if exists "protocol_endpoints select scoped" on public.protocol_endpoints;
create policy "protocol_endpoints select scoped" on public.protocol_endpoints for select to authenticated
  using (public.can_access_study(study_id));
drop policy if exists "protocol_endpoints write scoped" on public.protocol_endpoints;
create policy "protocol_endpoints write scoped" on public.protocol_endpoints for all to authenticated
  using (public.is_admin_or_study_manager())
  with check (public.is_admin_or_study_manager());

alter table if exists public.protocol_amendments enable row level security;
drop policy if exists "protocol_amendments select scoped" on public.protocol_amendments;
create policy "protocol_amendments select scoped" on public.protocol_amendments for select to authenticated
  using (public.can_access_study(study_id));
drop policy if exists "protocol_amendments write scoped" on public.protocol_amendments;
create policy "protocol_amendments write scoped" on public.protocol_amendments for all to authenticated
  using (public.is_admin_or_study_manager())
  with check (public.is_admin_or_study_manager());

-- Site delegation and assignments
alter table if exists public.site_members enable row level security;
drop policy if exists "site_members select scoped" on public.site_members;
create policy "site_members select scoped" on public.site_members for select to authenticated
  using (public.can_access_site(site_id));
drop policy if exists "site_members write scoped" on public.site_members;
create policy "site_members write scoped" on public.site_members for all to authenticated
  using (public.can_manage_site_members(site_id))
  with check (public.can_manage_site_members(site_id));

alter table if exists public.subject_assignments enable row level security;
drop policy if exists "subject_assignments select scoped" on public.subject_assignments;
create policy "subject_assignments select scoped" on public.subject_assignments for select to authenticated
  using (
    exists (
      select 1
      from public.subjects s
      where s.id = subject_assignments.subject_id
        and public.can_access_site(s.site_id)
    )
  );
drop policy if exists "subject_assignments write scoped" on public.subject_assignments;
create policy "subject_assignments write scoped" on public.subject_assignments for all to authenticated
  using (
    exists (
      select 1
      from public.subjects s
      where s.id = subject_assignments.subject_id
        and public.can_assign_subject(s.site_id)
    )
  )
  with check (
    exists (
      select 1
      from public.subjects s
      where s.id = subject_assignments.subject_id
        and public.can_assign_subject(s.site_id)
    )
  );

-- Audit logs readable by study/site scope, write by authenticated
alter table if exists public.audit_logs enable row level security;
drop policy if exists "audit_logs select scoped" on public.audit_logs;
create policy "audit_logs select scoped" on public.audit_logs for select to authenticated
  using (
    public.is_admin_or_study_manager()
    or (
      table_name in ('sites', 'subjects', 'monitoring_visits', 'deviations', 'site_members', 'subject_assignments')
      and exists (
        select 1
        from public.sites s
        where s.id = audit_logs.record_id
          and public.can_access_site(s.id)
      )
    )
    or (
      table_name in ('studies', 'milestones', 'documents', 'protocol_objectives', 'eligibility_criteria', 'study_arms', 'visit_definitions', 'protocol_endpoints', 'protocol_amendments')
      and public.can_access_study(audit_logs.record_id)
    )
  );
drop policy if exists "audit_logs insert own" on public.audit_logs;
create policy "audit_logs insert own" on public.audit_logs for insert to authenticated
  with check (performed_by = auth.uid());

