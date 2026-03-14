-- Fix site create failures when API uses INSERT ... RETURNING under RLS.
-- Root cause: previous SELECT policy depended on can_access_site(id), which can fail
-- for brand-new rows during RETURNING visibility checks.

DROP POLICY IF EXISTS "sites select scoped" ON public.sites;

CREATE POLICY "sites select scoped"
ON public.sites
FOR SELECT
TO authenticated
USING (
  public.can_access_study(study_id)
  OR EXISTS (
    SELECT 1
    FROM public.site_members sm
    WHERE sm.site_id = sites.id
      AND sm.user_id = auth.uid()
  )
);
