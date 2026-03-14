-- Milestone task board enhancements (Trello-style assignment + completion)

ALTER TABLE public.milestones
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS site_id uuid REFERENCES public.sites(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS assignee_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS board_order integer NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_milestones_site_id ON public.milestones(site_id);
CREATE INDEX IF NOT EXISTS idx_milestones_assignee_user_id ON public.milestones(assignee_user_id);
CREATE INDEX IF NOT EXISTS idx_milestones_board_order ON public.milestones(study_id, status, board_order);

UPDATE public.milestones
SET created_by = COALESCE(created_by, (
  SELECT s.owner_user_id
  FROM public.studies s
  WHERE s.id = milestones.study_id
))
WHERE created_by IS NULL;

CREATE OR REPLACE FUNCTION public.can_complete_milestone(target_milestone_id uuid)
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
      FROM public.milestones m
      WHERE m.id = target_milestone_id
        AND public.can_manage_study(m.study_id)
    )
    OR EXISTS (
      SELECT 1
      FROM public.milestones m
      WHERE m.id = target_milestone_id
        AND m.assignee_user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1
      FROM public.milestones m
      JOIN public.site_members sm ON sm.site_id = m.site_id
      WHERE m.id = target_milestone_id
        AND sm.user_id = auth.uid()
    );
$$;

CREATE OR REPLACE FUNCTION public.enforce_milestone_update_scope()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF public.can_manage_study(OLD.study_id) THEN
    RETURN NEW;
  END IF;

  IF NOT public.can_complete_milestone(OLD.id) THEN
    RAISE EXCEPTION 'Forbidden milestone update';
  END IF;

  IF NEW.study_id IS DISTINCT FROM OLD.study_id
    OR NEW.name IS DISTINCT FROM OLD.name
    OR NEW.description IS DISTINCT FROM OLD.description
    OR NEW.planned_date IS DISTINCT FROM OLD.planned_date
    OR NEW.site_id IS DISTINCT FROM OLD.site_id
    OR NEW.assignee_user_id IS DISTINCT FROM OLD.assignee_user_id
    OR NEW.created_by IS DISTINCT FROM OLD.created_by
    OR NEW.board_order IS DISTINCT FROM OLD.board_order
  THEN
    RAISE EXCEPTION 'Only status/actual_date are editable by assignees';
  END IF;

  IF NEW.status NOT IN ('completed', 'missed') THEN
    RAISE EXCEPTION 'Assignees can only mark milestone as completed or missed';
  END IF;

  IF NEW.actual_date IS NULL THEN
    NEW.actual_date = CURRENT_DATE;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_milestone_update_scope_trigger ON public.milestones;
CREATE TRIGGER enforce_milestone_update_scope_trigger
BEFORE UPDATE ON public.milestones
FOR EACH ROW
EXECUTE FUNCTION public.enforce_milestone_update_scope();

DROP POLICY IF EXISTS "milestones write scoped" ON public.milestones;
DROP POLICY IF EXISTS "milestones update scoped" ON public.milestones;
CREATE POLICY "milestones update scoped" ON public.milestones
FOR UPDATE TO authenticated
USING (public.can_complete_milestone(id))
WITH CHECK (
  public.can_manage_study(study_id)
  OR (
    public.can_complete_milestone(id)
    AND status IN ('completed', 'missed', 'at_risk', 'pending')
  )
);

DROP POLICY IF EXISTS "milestones insert scoped" ON public.milestones;
CREATE POLICY "milestones insert scoped" ON public.milestones
FOR INSERT TO authenticated
WITH CHECK (public.can_manage_study(study_id));

DROP POLICY IF EXISTS "milestones delete scoped" ON public.milestones;
CREATE POLICY "milestones delete scoped" ON public.milestones
FOR DELETE TO authenticated
USING (public.can_manage_study(study_id));
