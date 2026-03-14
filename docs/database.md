# Database

## Source Of Truth

- Migrations live in `supabase/migrations/`
- Current baseline migration: `20260314000001_ctms_schema.sql`
- Protocol extension migration (Sprint 1): `20260314000006_protocol_entities.sql`
- Site permissions + assignments migration: `20260314000007_site_permissions_and_assignments.sql`
- RLS restoration + scope policies migration: `20260314000008_restore_rls_with_scope_policies.sql`
- Electronic signatures migration: `20260315000001_signatures.sql`
- SaaS ownership + subject forms migration: `20260315000002_saas_ownership_and_subject_forms.sql`
- Milestone task board migration: `20260315000009_milestone_task_board.sql`
- Multi-tenant RLS cleanup migration: `20260315000010_fix_site_insert_and_multitenant_policy_cleanup.sql`
- Sites INSERT RETURNING RLS fix: `20260315000011_fix_sites_select_policy_for_insert_returning.sql`
- Supabase Auth schema (`auth.*`) is preserved; this project only mutates `public.*`

## Current Public Tables

- `profiles`
- `studies`
- `study_team`
- `protocol_objectives`
- `eligibility_criteria`
- `study_arms`
- `visit_definitions`
- `protocol_endpoints`
- `protocol_amendments`
- `sites`
- `subjects`
- `monitoring_visits`
- `deviations`
- `milestones`
- `documents`
- `audit_logs`
- `signatures`
- `site_members`
- `subject_assignments`
- `subject_form_templates`
- `subject_form_assignments`
- `subject_form_submissions`
- `subject_portal_links`

## Auth And Trigger Notes

- `public.handle_new_user()` is preserved and sets new profiles to role `viewer`.
- Trigger `on_auth_user_created` remains attached to `auth.users`.
- `public.set_updated_at()` is used by all mutable CTMS tables plus `profiles`.
- `public.sync_site_enrollment()` updates site enrollment counters when subject status changes.
- `studies` includes two protocol narrative fields: `safety_rules`, `statistical_plan`.
- `studies.owner_user_id` is the tenant owner for the study.
- Site-level delegation model:
  - `site_members` stores owner/admin/viewer and permission bitmask per site.
  - `subject_assignments` maps operational owners (nurse/doctor/etc.) per subject.
- Milestone task board model:
  - `milestones` now supports task details + assignment:
    - `description`
    - `site_id` (clinic assignment)
    - `assignee_user_id` (direct user assignment)
    - `created_by`
    - `board_order` (kanban column ordering)
  - `public.can_complete_milestone(uuid)` enables assignee/site-member completion checks.
  - Trigger `enforce_milestone_update_scope_trigger` restricts non-manager updates to completion fields.
- Signature model:
  - `signatures` stores basic credential re-confirmed approvals/closures for documents, deviations, and monitoring records.
- Subject form model:
  - `subject_form_templates` stores no-code JSON schema templates.
  - `subject_form_assignments` schedules templates for subjects.
  - `subject_form_submissions` stores patient/staff responses.
  - `subject_portal_links` maps patient auth users to subject records.
- Study creation RPC:
  - `public.create_study_as_owner(...)` inserts study + owner team row + default milestones in one transaction.
  - Used by API to avoid intermittent RLS insert failures.

## RLS

RLS is enabled across CTMS tables using scoped policies from migration `20260314000008_restore_rls_with_scope_policies.sql`.

Policy model:

- SaaS isolation mode:
  - `admin` is the only global role.
- Study ownership is enforced by `studies.owner_user_id` (with optional `study_team` owner/manager rows for collaboration).
- Site admin/staff can only operate on site-scoped entities through membership + bitmask permissions.
- Site creation uses insert policy `WITH CHECK can_manage_study(study_id)` to avoid new-row `id` lookup failures.
- Site read policy is study-scoped (`can_access_study(study_id)`) so API `insert(...).select(...)` works under RLS.
- Study-scoped access uses `study_team` and inherited study access via `site_members`.
- Site-scoped access uses `site_members` role + permission bitmask.
- Subject and assignment actions enforce site-level permission checks.
- Milestone writes are split by operation:
  - Insert/Delete: study managers (owner/admin scope) only.
  - Update: study managers plus assigned user/site member completion workflow.

## Migration Workflow

```bash
npx supabase link --project-ref btyegkygtvotuaxjjzgl
npx supabase db push
```

## Verification Queries

```sql
-- Confirm RLS is enabled across public tables
select tablename, rowsecurity
from pg_tables
where schemaname = 'public'
order by tablename;

-- Confirm policies
select tablename, policyname, cmd
from pg_policies
where schemaname = 'public'
order by tablename, policyname;
```
