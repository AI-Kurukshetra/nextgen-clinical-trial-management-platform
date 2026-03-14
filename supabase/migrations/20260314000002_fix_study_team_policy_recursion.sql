-- Fix recursive RLS evaluation on public.study_team policies.

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

drop policy if exists "Managers manage study team" on public.study_team;
create policy "Managers manage study team"
  on public.study_team for all to authenticated
  using (public.is_study_manager_for_study(study_team.study_id))
  with check (public.is_study_manager_for_study(study_team.study_id));
