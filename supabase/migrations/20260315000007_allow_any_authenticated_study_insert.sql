-- Ensure any authenticated user can create a study as owner.

ALTER TABLE public.studies
  ALTER COLUMN owner_user_id SET DEFAULT auth.uid();

DROP POLICY IF EXISTS "studies write scoped" ON public.studies;

CREATE POLICY "studies insert own"
ON public.studies
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() IS NOT NULL
  AND owner_user_id = auth.uid()
  AND created_by = auth.uid()
);

CREATE POLICY "studies update scoped"
ON public.studies
FOR UPDATE
TO authenticated
USING (public.can_manage_study(id))
WITH CHECK (public.can_manage_study(id));

CREATE POLICY "studies delete scoped"
ON public.studies
FOR DELETE
TO authenticated
USING (public.can_manage_study(id));
