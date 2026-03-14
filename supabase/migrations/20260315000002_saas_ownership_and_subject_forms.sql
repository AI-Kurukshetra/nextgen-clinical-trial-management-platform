-- SaaS tenancy hardening + owner model + subject form workflows

-- 1) Study ownership
ALTER TABLE public.studies
  ADD COLUMN IF NOT EXISTS owner_user_id uuid REFERENCES auth.users(id);

UPDATE public.studies
SET owner_user_id = created_by
WHERE owner_user_id IS NULL
  AND created_by IS NOT NULL;

-- Fallback for legacy rows with null created_by: choose earliest study_team user
UPDATE public.studies s
SET owner_user_id = (
  SELECT st.user_id
  FROM public.study_team st
  WHERE st.study_id = s.id
  ORDER BY st.created_at ASC
  LIMIT 1
)
WHERE s.owner_user_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_studies_owner_user_id ON public.studies(owner_user_id);

ALTER TABLE public.study_team
  DROP CONSTRAINT IF EXISTS study_team_role_check;
ALTER TABLE public.study_team
  ADD CONSTRAINT study_team_role_check
  CHECK (role IN ('owner','study_manager','monitor','site_coordinator','viewer'));

-- Ensure each study owner is also in study_team as owner
INSERT INTO public.study_team (study_id, user_id, role)
SELECT s.id, s.owner_user_id, 'owner'
FROM public.studies s
WHERE s.owner_user_id IS NOT NULL
ON CONFLICT (study_id, user_id) DO UPDATE SET role = 'owner';

-- 2) Access helper functions (strict isolation)
CREATE OR REPLACE FUNCTION public.is_admin_or_study_manager()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  -- Preserve function name for backward compatibility with existing policies.
  -- In SaaS mode only platform admins are global operators.
  SELECT public.is_admin()
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

CREATE OR REPLACE FUNCTION public.can_access_site(target_site_id uuid)
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
      FROM public.site_members sm
      WHERE sm.site_id = target_site_id
        AND sm.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1
      FROM public.sites s
      WHERE s.id = target_site_id
        AND public.can_access_study(s.study_id)
    )
$$;

CREATE OR REPLACE FUNCTION public.can_manage_site(target_site_id uuid)
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
      FROM public.sites s
      WHERE s.id = target_site_id
        AND public.can_manage_study(s.study_id)
    )
    OR EXISTS (
      SELECT 1
      FROM public.site_members sm
      WHERE sm.site_id = target_site_id
        AND sm.user_id = auth.uid()
        AND (
          sm.role IN ('owner', 'admin')
          OR (sm.permission_mask & (1 << 0)) = (1 << 0)
        )
    )
$$;

CREATE OR REPLACE FUNCTION public.can_manage_site_members(target_site_id uuid)
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
      FROM public.sites s
      WHERE s.id = target_site_id
        AND public.can_manage_study(s.study_id)
    )
    OR EXISTS (
      SELECT 1
      FROM public.site_members sm
      WHERE sm.site_id = target_site_id
        AND sm.user_id = auth.uid()
        AND (
          sm.role IN ('owner', 'admin')
          OR (sm.permission_mask & (1 << 1)) = (1 << 1)
        )
    )
$$;

CREATE OR REPLACE FUNCTION public.can_create_subject(target_site_id uuid)
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
      FROM public.sites s
      WHERE s.id = target_site_id
        AND public.can_manage_study(s.study_id)
    )
    OR EXISTS (
      SELECT 1
      FROM public.site_members sm
      WHERE sm.site_id = target_site_id
        AND sm.user_id = auth.uid()
        AND (sm.permission_mask & (1 << 2)) = (1 << 2)
    )
$$;

CREATE OR REPLACE FUNCTION public.can_update_subject(target_site_id uuid)
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
      FROM public.sites s
      WHERE s.id = target_site_id
        AND public.can_manage_study(s.study_id)
    )
    OR EXISTS (
      SELECT 1
      FROM public.site_members sm
      WHERE sm.site_id = target_site_id
        AND sm.user_id = auth.uid()
        AND (sm.permission_mask & (1 << 3)) = (1 << 3)
    )
$$;

CREATE OR REPLACE FUNCTION public.can_assign_subject(target_site_id uuid)
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
      FROM public.sites s
      WHERE s.id = target_site_id
        AND public.can_manage_study(s.study_id)
    )
    OR EXISTS (
      SELECT 1
      FROM public.site_members sm
      WHERE sm.site_id = target_site_id
        AND sm.user_id = auth.uid()
        AND (sm.permission_mask & (1 << 4)) = (1 << 4)
    )
$$;

-- 3) Rewrite study-scoped write policies to owner/manager model
DROP POLICY IF EXISTS "studies write manager" ON public.studies;
CREATE POLICY "studies write scoped" ON public.studies
FOR ALL TO authenticated
USING (public.can_manage_study(id))
WITH CHECK (
  public.is_admin()
  OR owner_user_id = auth.uid()
  OR public.can_manage_study(id)
);

DROP POLICY IF EXISTS "study_team write manager" ON public.study_team;
CREATE POLICY "study_team write scoped" ON public.study_team
FOR ALL TO authenticated
USING (public.can_manage_study(study_id))
WITH CHECK (public.can_manage_study(study_id));

DROP POLICY IF EXISTS "milestones write scoped" ON public.milestones;
CREATE POLICY "milestones write scoped" ON public.milestones
FOR ALL TO authenticated
USING (public.can_manage_study(study_id))
WITH CHECK (public.can_manage_study(study_id));

DROP POLICY IF EXISTS "protocol_objectives write scoped" ON public.protocol_objectives;
CREATE POLICY "protocol_objectives write scoped" ON public.protocol_objectives
FOR ALL TO authenticated
USING (public.can_manage_study(study_id))
WITH CHECK (public.can_manage_study(study_id));

DROP POLICY IF EXISTS "eligibility_criteria write scoped" ON public.eligibility_criteria;
CREATE POLICY "eligibility_criteria write scoped" ON public.eligibility_criteria
FOR ALL TO authenticated
USING (public.can_manage_study(study_id))
WITH CHECK (public.can_manage_study(study_id));

DROP POLICY IF EXISTS "study_arms write scoped" ON public.study_arms;
CREATE POLICY "study_arms write scoped" ON public.study_arms
FOR ALL TO authenticated
USING (public.can_manage_study(study_id))
WITH CHECK (public.can_manage_study(study_id));

DROP POLICY IF EXISTS "visit_definitions write scoped" ON public.visit_definitions;
CREATE POLICY "visit_definitions write scoped" ON public.visit_definitions
FOR ALL TO authenticated
USING (public.can_manage_study(study_id))
WITH CHECK (public.can_manage_study(study_id));

DROP POLICY IF EXISTS "protocol_endpoints write scoped" ON public.protocol_endpoints;
CREATE POLICY "protocol_endpoints write scoped" ON public.protocol_endpoints
FOR ALL TO authenticated
USING (public.can_manage_study(study_id))
WITH CHECK (public.can_manage_study(study_id));

DROP POLICY IF EXISTS "protocol_amendments write scoped" ON public.protocol_amendments;
CREATE POLICY "protocol_amendments write scoped" ON public.protocol_amendments
FOR ALL TO authenticated
USING (public.can_manage_study(study_id))
WITH CHECK (public.can_manage_study(study_id));

DROP POLICY IF EXISTS "documents write scoped" ON public.documents;
CREATE POLICY "documents write scoped" ON public.documents
FOR ALL TO authenticated
USING (
  CASE
    WHEN site_id IS NOT NULL THEN public.can_manage_site(site_id)
    ELSE public.can_manage_study(study_id)
  END
)
WITH CHECK (
  CASE
    WHEN site_id IS NOT NULL THEN public.can_manage_site(site_id)
    ELSE public.can_manage_study(study_id)
  END
);

-- 4) Subject forms (template -> assignment -> submission)
CREATE TABLE IF NOT EXISTS public.subject_form_templates (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  study_id     uuid NOT NULL REFERENCES public.studies(id) ON DELETE CASCADE,
  site_id      uuid REFERENCES public.sites(id) ON DELETE CASCADE,
  name         text NOT NULL,
  description  text,
  schema       jsonb NOT NULL DEFAULT '{}'::jsonb, -- no-code JSON schema
  is_active    boolean NOT NULL DEFAULT true,
  created_by   uuid REFERENCES auth.users(id),
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.subject_form_assignments (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id    uuid NOT NULL REFERENCES public.subject_form_templates(id) ON DELETE CASCADE,
  study_id       uuid NOT NULL REFERENCES public.studies(id) ON DELETE CASCADE,
  site_id        uuid NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
  subject_id     uuid NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  recurrence     text NOT NULL DEFAULT 'ad_hoc' CHECK (recurrence IN ('once','daily','weekly','monthly','ad_hoc')),
  due_at         timestamptz,
  status         text NOT NULL DEFAULT 'assigned' CHECK (status IN ('assigned','submitted','overdue','cancelled')),
  assigned_by    uuid REFERENCES auth.users(id),
  created_at     timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.subject_form_submissions (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id  uuid NOT NULL REFERENCES public.subject_form_assignments(id) ON DELETE CASCADE,
  template_id    uuid NOT NULL REFERENCES public.subject_form_templates(id) ON DELETE CASCADE,
  study_id       uuid NOT NULL REFERENCES public.studies(id) ON DELETE CASCADE,
  site_id        uuid NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
  subject_id     uuid NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  submitted_by   uuid REFERENCES auth.users(id),
  answers        jsonb NOT NULL DEFAULT '{}'::jsonb,
  notes          text,
  submitted_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.subject_portal_links (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id   uuid NOT NULL UNIQUE REFERENCES public.subjects(id) ON DELETE CASCADE,
  user_id      uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  linked_by    uuid REFERENCES auth.users(id),
  status       text NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive')),
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_subject_form_templates_study ON public.subject_form_templates(study_id);
CREATE INDEX IF NOT EXISTS idx_subject_form_templates_site ON public.subject_form_templates(site_id);
CREATE INDEX IF NOT EXISTS idx_subject_form_assignments_subject ON public.subject_form_assignments(subject_id, status);
CREATE INDEX IF NOT EXISTS idx_subject_form_assignments_study ON public.subject_form_assignments(study_id);
CREATE INDEX IF NOT EXISTS idx_subject_form_submissions_assignment ON public.subject_form_submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_subject_portal_links_user ON public.subject_portal_links(user_id);

CREATE TRIGGER set_subject_form_templates_updated_at
BEFORE UPDATE ON public.subject_form_templates
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.subject_form_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subject_form_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subject_form_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subject_portal_links ENABLE ROW LEVEL SECURITY;

-- Templates
CREATE POLICY "subject_form_templates select scoped" ON public.subject_form_templates
FOR SELECT TO authenticated USING (public.can_access_study(study_id));
CREATE POLICY "subject_form_templates write scoped" ON public.subject_form_templates
FOR ALL TO authenticated
USING (
  CASE
    WHEN site_id IS NULL THEN public.can_manage_study(study_id)
    ELSE public.can_manage_site(site_id)
  END
)
WITH CHECK (
  CASE
    WHEN site_id IS NULL THEN public.can_manage_study(study_id)
    ELSE public.can_manage_site(site_id)
  END
);

-- Assignments
CREATE POLICY "subject_form_assignments select scoped" ON public.subject_form_assignments
FOR SELECT TO authenticated
USING (
  public.can_access_site(site_id)
  OR EXISTS (
    SELECT 1
    FROM public.subject_portal_links spl
    WHERE spl.subject_id = subject_form_assignments.subject_id
      AND spl.user_id = auth.uid()
      AND spl.status = 'active'
  )
);
CREATE POLICY "subject_form_assignments write scoped" ON public.subject_form_assignments
FOR ALL TO authenticated
USING (public.can_manage_site(site_id))
WITH CHECK (public.can_manage_site(site_id));

-- Submissions
CREATE POLICY "subject_form_submissions select scoped" ON public.subject_form_submissions
FOR SELECT TO authenticated
USING (
  public.can_access_site(site_id)
  OR EXISTS (
    SELECT 1
    FROM public.subject_portal_links spl
    WHERE spl.subject_id = subject_form_submissions.subject_id
      AND spl.user_id = auth.uid()
      AND spl.status = 'active'
  )
);
CREATE POLICY "subject_form_submissions insert scoped" ON public.subject_form_submissions
FOR INSERT TO authenticated
WITH CHECK (
  public.can_access_site(site_id)
  OR EXISTS (
    SELECT 1
    FROM public.subject_portal_links spl
    WHERE spl.subject_id = subject_form_submissions.subject_id
      AND spl.user_id = auth.uid()
      AND spl.status = 'active'
  )
);

-- Portal links
CREATE POLICY "subject_portal_links select scoped" ON public.subject_portal_links
FOR SELECT TO authenticated
USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1
    FROM public.subjects s
    WHERE s.id = subject_portal_links.subject_id
      AND public.can_manage_site(s.site_id)
  )
);
CREATE POLICY "subject_portal_links write scoped" ON public.subject_portal_links
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.subjects s
    WHERE s.id = subject_portal_links.subject_id
      AND public.can_manage_site(s.site_id)
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.subjects s
    WHERE s.id = subject_portal_links.subject_id
      AND public.can_manage_site(s.site_id)
  )
);
