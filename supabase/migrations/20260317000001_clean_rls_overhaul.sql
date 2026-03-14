-- Clean consolidated RLS overhaul.
-- Replaces all patchwork policies from 15+ prior migrations.
-- monitoring_visits and deviations tables are kept but locked down.

-- ============================================================
-- 1. DROP ALL EXISTING POLICIES
-- ============================================================

-- profiles
DROP POLICY IF EXISTS "profiles select own" ON public.profiles;
DROP POLICY IF EXISTS "profiles update own" ON public.profiles;
DROP POLICY IF EXISTS "profiles delete admin" ON public.profiles;
DROP POLICY IF EXISTS "profiles admin all" ON public.profiles;
DROP POLICY IF EXISTS "Allow users to manage their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "profiles select" ON public.profiles;
DROP POLICY IF EXISTS "profiles update" ON public.profiles;
DROP POLICY IF EXISTS "profiles delete" ON public.profiles;

-- studies
DROP POLICY IF EXISTS "studies select scoped" ON public.studies;
DROP POLICY IF EXISTS "studies write scoped" ON public.studies;
DROP POLICY IF EXISTS "studies insert own" ON public.studies;
DROP POLICY IF EXISTS "studies insert" ON public.studies;
DROP POLICY IF EXISTS "studies update" ON public.studies;
DROP POLICY IF EXISTS "studies delete" ON public.studies;
DROP POLICY IF EXISTS "Admins full access to studies" ON public.studies;
DROP POLICY IF EXISTS "Study team can view studies" ON public.studies;
DROP POLICY IF EXISTS "Study managers can create studies" ON public.studies;
DROP POLICY IF EXISTS "Study managers can update studies" ON public.studies;
DROP POLICY IF EXISTS "Allow study managers to create studies" ON public.studies;
DROP POLICY IF EXISTS "Allow any authenticated user to create studies" ON public.studies;

-- study_team
DROP POLICY IF EXISTS "study_team select scoped" ON public.study_team;
DROP POLICY IF EXISTS "study_team write scoped" ON public.study_team;
DROP POLICY IF EXISTS "study_team insert" ON public.study_team;
DROP POLICY IF EXISTS "study_team update" ON public.study_team;
DROP POLICY IF EXISTS "study_team delete" ON public.study_team;
DROP POLICY IF EXISTS "Study team can view their team" ON public.study_team;
DROP POLICY IF EXISTS "Managers can manage team" ON public.study_team;
DROP POLICY IF EXISTS "study team members can view" ON public.study_team;
DROP POLICY IF EXISTS "study managers can insert team" ON public.study_team;
DROP POLICY IF EXISTS "Allow study owner access" ON public.study_team;
DROP POLICY IF EXISTS "study_team owner access" ON public.study_team;

-- sites
DROP POLICY IF EXISTS "sites select scoped" ON public.sites;
DROP POLICY IF EXISTS "sites write scoped" ON public.sites;
DROP POLICY IF EXISTS "sites insert scoped" ON public.sites;
DROP POLICY IF EXISTS "sites update scoped" ON public.sites;
DROP POLICY IF EXISTS "sites delete scoped" ON public.sites;
DROP POLICY IF EXISTS "sites select" ON public.sites;
DROP POLICY IF EXISTS "sites insert" ON public.sites;
DROP POLICY IF EXISTS "sites update" ON public.sites;
DROP POLICY IF EXISTS "sites delete" ON public.sites;
DROP POLICY IF EXISTS "Admins manage all sites" ON public.sites;
DROP POLICY IF EXISTS "Study team can view sites" ON public.sites;
DROP POLICY IF EXISTS "Managers can manage sites" ON public.sites;

-- subjects
DROP POLICY IF EXISTS "subjects select scoped" ON public.subjects;
DROP POLICY IF EXISTS "subjects insert scoped" ON public.subjects;
DROP POLICY IF EXISTS "subjects update scoped" ON public.subjects;
DROP POLICY IF EXISTS "subjects delete scoped" ON public.subjects;
DROP POLICY IF EXISTS "subjects select" ON public.subjects;
DROP POLICY IF EXISTS "subjects insert" ON public.subjects;
DROP POLICY IF EXISTS "subjects update" ON public.subjects;
DROP POLICY IF EXISTS "subjects delete" ON public.subjects;
DROP POLICY IF EXISTS "Admins manage all subjects" ON public.subjects;
DROP POLICY IF EXISTS "Clinical roles can manage subjects" ON public.subjects;
DROP POLICY IF EXISTS "Study team can view subjects" ON public.subjects;

-- milestones
DROP POLICY IF EXISTS "milestones select scoped" ON public.milestones;
DROP POLICY IF EXISTS "milestones insert scoped" ON public.milestones;
DROP POLICY IF EXISTS "milestones update scoped" ON public.milestones;
DROP POLICY IF EXISTS "milestones delete scoped" ON public.milestones;
DROP POLICY IF EXISTS "milestones select" ON public.milestones;
DROP POLICY IF EXISTS "milestones insert" ON public.milestones;
DROP POLICY IF EXISTS "milestones update" ON public.milestones;
DROP POLICY IF EXISTS "milestones delete" ON public.milestones;
DROP POLICY IF EXISTS "Admins manage milestones" ON public.milestones;
DROP POLICY IF EXISTS "Managers manage milestones" ON public.milestones;
DROP POLICY IF EXISTS "Study team view milestones" ON public.milestones;

-- documents
DROP POLICY IF EXISTS "documents select scoped" ON public.documents;
DROP POLICY IF EXISTS "documents insert scoped" ON public.documents;
DROP POLICY IF EXISTS "documents update scoped" ON public.documents;
DROP POLICY IF EXISTS "documents delete scoped" ON public.documents;
DROP POLICY IF EXISTS "documents select" ON public.documents;
DROP POLICY IF EXISTS "documents insert" ON public.documents;
DROP POLICY IF EXISTS "documents update" ON public.documents;
DROP POLICY IF EXISTS "documents delete" ON public.documents;
DROP POLICY IF EXISTS "Admins manage documents" ON public.documents;
DROP POLICY IF EXISTS "Clinical roles manage documents" ON public.documents;
DROP POLICY IF EXISTS "Study team view documents" ON public.documents;

-- audit_logs
DROP POLICY IF EXISTS "audit_logs select scoped" ON public.audit_logs;
DROP POLICY IF EXISTS "audit_logs insert scoped" ON public.audit_logs;
DROP POLICY IF EXISTS "audit_logs admin all" ON public.audit_logs;
DROP POLICY IF EXISTS "audit_logs select" ON public.audit_logs;
DROP POLICY IF EXISTS "audit_logs insert" ON public.audit_logs;
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Admins view audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Team members can view study audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Authenticated users can insert audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Authenticated users can write audit logs" ON public.audit_logs;

-- signatures
DROP POLICY IF EXISTS "signatures select scoped" ON public.signatures;
DROP POLICY IF EXISTS "signatures insert own" ON public.signatures;
DROP POLICY IF EXISTS "signatures select" ON public.signatures;
DROP POLICY IF EXISTS "signatures insert" ON public.signatures;
DROP POLICY IF EXISTS "Signatures team can view" ON public.signatures;
DROP POLICY IF EXISTS "Authenticated users can sign" ON public.signatures;

-- site_members
DROP POLICY IF EXISTS "site_members select scoped" ON public.site_members;
DROP POLICY IF EXISTS "site_members insert scoped" ON public.site_members;
DROP POLICY IF EXISTS "site_members update scoped" ON public.site_members;
DROP POLICY IF EXISTS "site_members delete scoped" ON public.site_members;
DROP POLICY IF EXISTS "site_members select" ON public.site_members;
DROP POLICY IF EXISTS "site_members insert" ON public.site_members;
DROP POLICY IF EXISTS "site_members update" ON public.site_members;
DROP POLICY IF EXISTS "site_members delete" ON public.site_members;
DROP POLICY IF EXISTS "Admins manage all site members" ON public.site_members;
DROP POLICY IF EXISTS "Site owners can manage members" ON public.site_members;
DROP POLICY IF EXISTS "Members can view their own membership" ON public.site_members;

-- monitoring_visits
DROP POLICY IF EXISTS "monitoring_visits select scoped" ON public.monitoring_visits;
DROP POLICY IF EXISTS "monitoring_visits insert scoped" ON public.monitoring_visits;
DROP POLICY IF EXISTS "monitoring_visits update scoped" ON public.monitoring_visits;
DROP POLICY IF EXISTS "monitoring_visits delete scoped" ON public.monitoring_visits;
DROP POLICY IF EXISTS "Admins manage visits" ON public.monitoring_visits;
DROP POLICY IF EXISTS "Monitors manage visits" ON public.monitoring_visits;
DROP POLICY IF EXISTS "Study team view visits" ON public.monitoring_visits;

-- deviations
DROP POLICY IF EXISTS "deviations select scoped" ON public.deviations;
DROP POLICY IF EXISTS "deviations insert scoped" ON public.deviations;
DROP POLICY IF EXISTS "deviations update scoped" ON public.deviations;
DROP POLICY IF EXISTS "deviations delete scoped" ON public.deviations;
DROP POLICY IF EXISTS "Admins manage deviations" ON public.deviations;
DROP POLICY IF EXISTS "Clinical roles manage deviations" ON public.deviations;
DROP POLICY IF EXISTS "Study team view deviations" ON public.deviations;

-- ============================================================
-- 2. DROP ALL EXISTING HELPER FUNCTIONS (CASCADE to remove dependent policies)
-- ============================================================

DROP FUNCTION IF EXISTS public.current_role() CASCADE;
DROP FUNCTION IF EXISTS public.get_user_role() CASCADE;
DROP FUNCTION IF EXISTS public.is_admin() CASCADE;
DROP FUNCTION IF EXISTS public.is_study_manager() CASCADE;
DROP FUNCTION IF EXISTS public.is_admin_or_study_manager() CASCADE;
DROP FUNCTION IF EXISTS public.can_access_study(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.can_manage_study(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.can_access_site(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.can_manage_site(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.owns_study(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.in_study_team(uuid) CASCADE;

-- ============================================================
-- 3. CLEAN HELPER FUNCTIONS (SECURITY DEFINER, no cross-table recursion)
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid()
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT COALESCE(public.get_user_role() = 'admin', false)
$$;

CREATE OR REPLACE FUNCTION public.is_study_manager()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT COALESCE(public.get_user_role() IN ('admin', 'study_manager'), false)
$$;

CREATE OR REPLACE FUNCTION public.owns_study(target_study_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.studies
    WHERE id = target_study_id AND owner_user_id = auth.uid()
  )
$$;

CREATE OR REPLACE FUNCTION public.in_study_team(target_study_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.study_team
    WHERE study_id = target_study_id AND user_id = auth.uid()
  )
$$;

-- No recursive calls to study_team from within study policies.
CREATE OR REPLACE FUNCTION public.can_access_study(target_study_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT
    public.is_admin()
    OR public.owns_study(target_study_id)
    OR public.in_study_team(target_study_id)
    OR EXISTS (
      SELECT 1
      FROM public.sites s
      JOIN public.site_members sm ON sm.site_id = s.id
      WHERE s.study_id = target_study_id AND sm.user_id = auth.uid()
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
    OR public.owns_study(target_study_id)
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
      SELECT 1 FROM public.sites s
      WHERE s.id = target_site_id
        AND (
          public.owns_study(s.study_id)
          OR public.in_study_team(s.study_id)
        )
    )
    OR EXISTS (
      SELECT 1 FROM public.site_members sm
      WHERE sm.site_id = target_site_id AND sm.user_id = auth.uid()
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
      SELECT 1 FROM public.sites s
      WHERE s.id = target_site_id
        AND public.can_manage_study(s.study_id)
    )
    OR EXISTS (
      SELECT 1 FROM public.site_members sm
      WHERE sm.site_id = target_site_id
        AND sm.user_id = auth.uid()
        AND sm.role IN ('owner', 'admin', 'coordinator')
    )
$$;

-- ============================================================
-- 4. ENSURE RLS IS ENABLED ON ALL TABLES
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.studies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_team ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monitoring_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deviations ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 5. PROFILES
-- ============================================================

CREATE POLICY "profiles select"
ON public.profiles FOR SELECT TO authenticated
USING (id = auth.uid() OR public.is_admin());

CREATE POLICY "profiles update"
ON public.profiles FOR UPDATE TO authenticated
USING (id = auth.uid() OR public.is_admin())
WITH CHECK (id = auth.uid() OR public.is_admin());

CREATE POLICY "profiles delete"
ON public.profiles FOR DELETE TO authenticated
USING (public.is_admin());

-- ============================================================
-- 6. STUDIES
-- ============================================================

CREATE POLICY "studies select"
ON public.studies FOR SELECT TO authenticated
USING (public.can_access_study(id));

-- INSERT via create_study_as_owner() RPC (SECURITY DEFINER).
-- Direct INSERT also allowed for authenticated users; trigger auto-sets ownership.
CREATE POLICY "studies insert"
ON public.studies FOR INSERT TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "studies update"
ON public.studies FOR UPDATE TO authenticated
USING (public.can_manage_study(id))
WITH CHECK (public.can_manage_study(id));

CREATE POLICY "studies delete"
ON public.studies FOR DELETE TO authenticated
USING (public.is_admin());

-- ============================================================
-- 7. STUDY_TEAM
-- ============================================================

CREATE POLICY "study_team select"
ON public.study_team FOR SELECT TO authenticated
USING (public.can_access_study(study_id));

CREATE POLICY "study_team insert"
ON public.study_team FOR INSERT TO authenticated
WITH CHECK (public.can_manage_study(study_id));

CREATE POLICY "study_team update"
ON public.study_team FOR UPDATE TO authenticated
USING (public.can_manage_study(study_id))
WITH CHECK (public.can_manage_study(study_id));

CREATE POLICY "study_team delete"
ON public.study_team FOR DELETE TO authenticated
USING (public.can_manage_study(study_id));

-- ============================================================
-- 8. SITES
-- ============================================================

CREATE POLICY "sites select"
ON public.sites FOR SELECT TO authenticated
USING (public.can_access_study(study_id));

CREATE POLICY "sites insert"
ON public.sites FOR INSERT TO authenticated
WITH CHECK (public.can_manage_study(study_id));

CREATE POLICY "sites update"
ON public.sites FOR UPDATE TO authenticated
USING (public.can_manage_site(id))
WITH CHECK (public.can_manage_site(id));

CREATE POLICY "sites delete"
ON public.sites FOR DELETE TO authenticated
USING (public.can_manage_study(study_id));

-- ============================================================
-- 9. SUBJECTS
-- ============================================================

CREATE POLICY "subjects select"
ON public.subjects FOR SELECT TO authenticated
USING (public.can_access_site(site_id));

CREATE POLICY "subjects insert"
ON public.subjects FOR INSERT TO authenticated
WITH CHECK (
  public.can_manage_study(study_id)
  OR public.can_manage_site(site_id)
);

CREATE POLICY "subjects update"
ON public.subjects FOR UPDATE TO authenticated
USING (
  public.can_manage_study(study_id)
  OR public.can_manage_site(site_id)
)
WITH CHECK (
  public.can_manage_study(study_id)
  OR public.can_manage_site(site_id)
);

CREATE POLICY "subjects delete"
ON public.subjects FOR DELETE TO authenticated
USING (public.can_manage_study(study_id));

-- ============================================================
-- 10. MILESTONES
-- ============================================================

CREATE POLICY "milestones select"
ON public.milestones FOR SELECT TO authenticated
USING (public.can_access_study(study_id));

CREATE POLICY "milestones insert"
ON public.milestones FOR INSERT TO authenticated
WITH CHECK (public.can_manage_study(study_id));

-- Team members can update status of assigned milestones; managers can update anything
CREATE POLICY "milestones update"
ON public.milestones FOR UPDATE TO authenticated
USING (public.can_access_study(study_id))
WITH CHECK (public.can_access_study(study_id));

CREATE POLICY "milestones delete"
ON public.milestones FOR DELETE TO authenticated
USING (public.can_manage_study(study_id));

-- ============================================================
-- 11. DOCUMENTS
-- ============================================================

CREATE POLICY "documents select"
ON public.documents FOR SELECT TO authenticated
USING (
  public.can_access_study(study_id)
  OR (site_id IS NOT NULL AND public.can_access_site(site_id))
);

CREATE POLICY "documents insert"
ON public.documents FOR INSERT TO authenticated
WITH CHECK (public.can_access_study(study_id));

CREATE POLICY "documents update"
ON public.documents FOR UPDATE TO authenticated
USING (
  public.can_manage_study(study_id)
  OR uploaded_by = auth.uid()
)
WITH CHECK (
  public.can_manage_study(study_id)
  OR uploaded_by = auth.uid()
);

CREATE POLICY "documents delete"
ON public.documents FOR DELETE TO authenticated
USING (public.can_manage_study(study_id) OR public.is_admin());

-- ============================================================
-- 12. AUDIT_LOGS (immutable — no UPDATE or DELETE)
-- ============================================================

CREATE POLICY "audit_logs select"
ON public.audit_logs FOR SELECT TO authenticated
USING (
  public.is_admin()
  OR performed_by = auth.uid()
);

CREATE POLICY "audit_logs insert"
ON public.audit_logs FOR INSERT TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================================
-- 13. SIGNATURES (immutable — no UPDATE or DELETE)
-- ============================================================

CREATE POLICY "signatures select"
ON public.signatures FOR SELECT TO authenticated
USING (
  signed_by = auth.uid()
  OR public.is_admin()
  OR (
    table_name = 'documents'
    AND EXISTS (
      SELECT 1 FROM public.documents d
      WHERE d.id = signatures.record_id
        AND public.can_access_study(d.study_id)
    )
  )
);

CREATE POLICY "signatures insert"
ON public.signatures FOR INSERT TO authenticated
WITH CHECK (signed_by = auth.uid());

-- ============================================================
-- 14. SITE_MEMBERS
-- ============================================================

CREATE POLICY "site_members select"
ON public.site_members FOR SELECT TO authenticated
USING (
  public.is_admin()
  OR user_id = auth.uid()
  OR public.can_access_site(site_id)
);

CREATE POLICY "site_members insert"
ON public.site_members FOR INSERT TO authenticated
WITH CHECK (public.can_manage_site(site_id) OR public.is_admin());

CREATE POLICY "site_members update"
ON public.site_members FOR UPDATE TO authenticated
USING (public.can_manage_site(site_id) OR public.is_admin())
WITH CHECK (public.can_manage_site(site_id) OR public.is_admin());

CREATE POLICY "site_members delete"
ON public.site_members FOR DELETE TO authenticated
USING (public.can_manage_site(site_id) OR public.is_admin());

-- ============================================================
-- 15. MONITORING_VISITS & DEVIATIONS — FULLY LOCKED DOWN
-- Tables remain in DB for audit/future admin SQL use.
-- No policies = no rows returned under RLS for any role.
-- ============================================================

-- (intentionally no policies created)

-- ============================================================
-- 16. GRANT EXECUTE PERMISSIONS ON HELPER FUNCTIONS
-- ============================================================

GRANT EXECUTE ON FUNCTION public.get_user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_study_manager() TO authenticated;
GRANT EXECUTE ON FUNCTION public.owns_study(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.in_study_team(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_access_study(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_manage_study(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_access_site(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_manage_site(uuid) TO authenticated;
