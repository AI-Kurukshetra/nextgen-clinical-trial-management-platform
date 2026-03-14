-- Fix site creation under RLS and remove legacy cross-tenant permissive policies.

-- 1) Sites: split ALL policy so INSERT checks study ownership, not site id.
DROP POLICY IF EXISTS "sites write scoped" ON public.sites;
DROP POLICY IF EXISTS "sites insert scoped" ON public.sites;
DROP POLICY IF EXISTS "sites update scoped" ON public.sites;
DROP POLICY IF EXISTS "sites delete scoped" ON public.sites;

CREATE POLICY "sites insert scoped"
ON public.sites
FOR INSERT
TO authenticated
WITH CHECK (public.can_manage_study(study_id));

CREATE POLICY "sites update scoped"
ON public.sites
FOR UPDATE
TO authenticated
USING (public.can_manage_site(id))
WITH CHECK (public.can_manage_site(id));

CREATE POLICY "sites delete scoped"
ON public.sites
FOR DELETE
TO authenticated
USING (public.can_manage_site(id));

-- 2) Remove legacy permissive role-only policies that can bypass tenant scoping.
-- Subjects
DROP POLICY IF EXISTS "Admins manage all subjects" ON public.subjects;
DROP POLICY IF EXISTS "Clinical roles can manage subjects" ON public.subjects;
DROP POLICY IF EXISTS "Study team can view subjects" ON public.subjects;

-- Monitoring visits
DROP POLICY IF EXISTS "Admins manage visits" ON public.monitoring_visits;
DROP POLICY IF EXISTS "Monitors manage visits" ON public.monitoring_visits;
DROP POLICY IF EXISTS "Study team view visits" ON public.monitoring_visits;

-- Deviations
DROP POLICY IF EXISTS "Admins manage deviations" ON public.deviations;
DROP POLICY IF EXISTS "Clinical roles manage deviations" ON public.deviations;
DROP POLICY IF EXISTS "Study team view deviations" ON public.deviations;

-- Milestones
DROP POLICY IF EXISTS "Admins manage milestones" ON public.milestones;
DROP POLICY IF EXISTS "Managers manage milestones" ON public.milestones;
DROP POLICY IF EXISTS "Study team view milestones" ON public.milestones;

-- Documents
DROP POLICY IF EXISTS "Admins manage documents" ON public.documents;
DROP POLICY IF EXISTS "Clinical roles manage documents" ON public.documents;
DROP POLICY IF EXISTS "Study team view documents" ON public.documents;
