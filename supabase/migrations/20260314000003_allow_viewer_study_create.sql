-- Allow viewer users to create studies in Sprint 1 environments.
-- This prevents RLS insert failures for freshly-created users defaulted to viewer.

drop policy if exists "Study managers can create studies" on public.studies;
create policy "Study managers can create studies"
  on public.studies for insert to authenticated
  with check (
    exists (
      select 1
      from public.profiles
      where id = auth.uid()
        and role in ('admin', 'study_manager', 'viewer')
    )
  );
