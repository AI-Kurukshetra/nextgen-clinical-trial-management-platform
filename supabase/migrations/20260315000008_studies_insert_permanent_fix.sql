-- Permanent fix: any authenticated user can create studies safely under RLS.

-- Ensure ownership fields auto-populate from JWT user when omitted.
ALTER TABLE public.studies
  ALTER COLUMN created_by SET DEFAULT auth.uid(),
  ALTER COLUMN owner_user_id SET DEFAULT auth.uid();

CREATE OR REPLACE FUNCTION public.set_study_ownership_defaults()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.created_by IS NULL THEN
    NEW.created_by := auth.uid();
  END IF;
  IF NEW.owner_user_id IS NULL THEN
    NEW.owner_user_id := auth.uid();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_study_ownership_defaults ON public.studies;
CREATE TRIGGER set_study_ownership_defaults
BEFORE INSERT ON public.studies
FOR EACH ROW
EXECUTE FUNCTION public.set_study_ownership_defaults();

-- INSERT policy should only require an authenticated user.
DROP POLICY IF EXISTS "studies insert own" ON public.studies;
CREATE POLICY "studies insert own"
ON public.studies
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);
