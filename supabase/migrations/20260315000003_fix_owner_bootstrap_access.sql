-- Fix owner bootstrap access for newly created studies under RLS

CREATE OR REPLACE FUNCTION public.can_manage_study(target_study_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT
    public.is_admin()
    OR EXISTS (
      SELECT 1
      FROM public.studies s
      WHERE s.id = target_study_id
        AND s.owner_user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1
      FROM public.study_team st
      WHERE st.study_id = target_study_id
        AND st.user_id = auth.uid()
        AND st.role IN ('owner','study_manager')
    )
$$;

CREATE OR REPLACE FUNCTION public.can_access_study(target_study_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT
    public.is_admin()
    OR EXISTS (
      SELECT 1
      FROM public.studies s
      WHERE s.id = target_study_id
        AND s.owner_user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1
      FROM public.study_team st
      WHERE st.study_id = target_study_id
        AND st.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1
      FROM public.sites s
      JOIN public.site_members sm ON sm.site_id = s.id
      WHERE s.study_id = target_study_id
        AND sm.user_id = auth.uid()
    )
$$;
