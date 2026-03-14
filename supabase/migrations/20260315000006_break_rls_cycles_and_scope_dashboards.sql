-- Break RLS policy cycles and enforce owner/site scoped tenancy.

-- 1) Helper functions that avoid study_team recursion paths
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
      FROM public.sites s
      JOIN public.site_members sm ON sm.site_id = s.id
      WHERE s.study_id = target_study_id
        AND sm.user_id = auth.uid()
    )
$$;

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
$$;

-- 2) Drop legacy policies that cause cross-table recursion
DROP POLICY IF EXISTS "Admins full access to studies" ON public.studies;
DROP POLICY IF EXISTS "Study team can view studies" ON public.studies;
DROP POLICY IF EXISTS "Study managers can create studies" ON public.studies;
DROP POLICY IF EXISTS "Study managers can update studies" ON public.studies;

DROP POLICY IF EXISTS "Admins manage all sites" ON public.sites;
DROP POLICY IF EXISTS "Study team can view sites" ON public.sites;
DROP POLICY IF EXISTS "Managers can manage sites" ON public.sites;

-- 3) Recreate minimal scoped policies
DROP POLICY IF EXISTS "studies select scoped" ON public.studies;
CREATE POLICY "studies select scoped"
ON public.studies
FOR SELECT
TO authenticated
USING (public.can_access_study(id));

DROP POLICY IF EXISTS "studies write scoped" ON public.studies;
CREATE POLICY "studies write scoped"
ON public.studies
FOR ALL
TO authenticated
USING (public.can_manage_study(id))
WITH CHECK (
  public.is_admin()
  OR owner_user_id = auth.uid()
  OR public.can_manage_study(id)
);

DROP POLICY IF EXISTS "sites select scoped" ON public.sites;
CREATE POLICY "sites select scoped"
ON public.sites
FOR SELECT
TO authenticated
USING (public.can_access_site(id));

DROP POLICY IF EXISTS "sites write scoped" ON public.sites;
CREATE POLICY "sites write scoped"
ON public.sites
FOR ALL
TO authenticated
USING (public.can_manage_site(id))
WITH CHECK (public.can_manage_site(id));
