-- Temporary hotfix: disable RLS across all public tables to bypass policy recursion issues.
-- Postgres defaults new tables to RLS disabled, so future tables stay non-RLS unless explicitly enabled.

alter table if exists public.profiles disable row level security;
alter table if exists public.studies disable row level security;
alter table if exists public.study_team disable row level security;
alter table if exists public.sites disable row level security;
alter table if exists public.subjects disable row level security;
alter table if exists public.monitoring_visits disable row level security;
alter table if exists public.deviations disable row level security;
alter table if exists public.milestones disable row level security;
alter table if exists public.documents disable row level security;
alter table if exists public.audit_logs disable row level security;
