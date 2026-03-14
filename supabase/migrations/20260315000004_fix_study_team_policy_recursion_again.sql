-- Fix infinite recursion on study_team RLS policies
-- Root cause: study_team policies called helper functions that queried study_team.

ALTER TABLE public.study_team ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "study_team select scoped" ON public.study_team;
CREATE POLICY "study_team select scoped"
ON public.study_team
FOR SELECT
TO authenticated
USING (
  public.is_admin()
  OR user_id = auth.uid()
  OR EXISTS (
    SELECT 1
    FROM public.studies s
    WHERE s.id = study_team.study_id
      AND s.owner_user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1
    FROM public.sites si
    JOIN public.site_members sm ON sm.site_id = si.id
    WHERE si.study_id = study_team.study_id
      AND sm.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "study_team write scoped" ON public.study_team;
CREATE POLICY "study_team write scoped"
ON public.study_team
FOR ALL
TO authenticated
USING (
  public.is_admin()
  OR EXISTS (
    SELECT 1
    FROM public.studies s
    WHERE s.id = study_team.study_id
      AND s.owner_user_id = auth.uid()
  )
)
WITH CHECK (
  public.is_admin()
  OR EXISTS (
    SELECT 1
    FROM public.studies s
    WHERE s.id = study_team.study_id
      AND s.owner_user_id = auth.uid()
  )
);
