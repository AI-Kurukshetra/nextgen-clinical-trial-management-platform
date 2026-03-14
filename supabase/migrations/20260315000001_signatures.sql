-- Sprint 10: basic electronic signatures

CREATE TABLE IF NOT EXISTS public.signatures (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name  text NOT NULL CHECK (table_name IN ('documents', 'deviations', 'monitoring_visits')),
  record_id   uuid NOT NULL,
  signed_by   uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason      text NOT NULL,
  meaning     text NOT NULL,
  ip_address  text,
  user_agent  text,
  signed_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_signatures_record
  ON public.signatures(table_name, record_id);

CREATE INDEX IF NOT EXISTS idx_signatures_signed_by
  ON public.signatures(signed_by);

ALTER TABLE public.signatures ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "signatures select scoped" ON public.signatures;
CREATE POLICY "signatures select scoped"
ON public.signatures
FOR SELECT
TO authenticated
USING (
  public.is_admin_or_study_manager()
  OR signed_by = auth.uid()
  OR (
    table_name = 'documents'
    AND EXISTS (
      SELECT 1
      FROM public.documents d
      WHERE d.id = signatures.record_id
        AND public.can_access_study(d.study_id)
    )
  )
  OR (
    table_name = 'deviations'
    AND EXISTS (
      SELECT 1
      FROM public.deviations dv
      WHERE dv.id = signatures.record_id
        AND public.can_access_study(dv.study_id)
    )
  )
  OR (
    table_name = 'monitoring_visits'
    AND EXISTS (
      SELECT 1
      FROM public.monitoring_visits mv
      WHERE mv.id = signatures.record_id
        AND public.can_access_study(mv.study_id)
    )
  )
);

DROP POLICY IF EXISTS "signatures insert own" ON public.signatures;
CREATE POLICY "signatures insert own"
ON public.signatures
FOR INSERT
TO authenticated
WITH CHECK (signed_by = auth.uid());
