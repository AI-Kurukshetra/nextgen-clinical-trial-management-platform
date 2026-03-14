-- Rebuild create_study_as_owner RPC without safety_rules and statistical_plan.
-- Those columns were dropped in migration 20260316000001.

CREATE OR REPLACE FUNCTION public.create_study_as_owner(
  p_protocol_number text,
  p_title text,
  p_phase text,
  p_status text,
  p_therapeutic_area text DEFAULT NULL,
  p_sponsor_name text DEFAULT NULL,
  p_indication text DEFAULT NULL,
  p_target_enrollment integer DEFAULT NULL,
  p_planned_start_date date DEFAULT NULL,
  p_planned_end_date date DEFAULT NULL,
  p_actual_start_date date DEFAULT NULL
)
RETURNS public.studies
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_study public.studies;
  v_milestones text[] := ARRAY[
    'Protocol Finalized',
    'IRB/Ethics Approval Received',
    'First Site Initiated (FSI)',
    'First Patient In (FPI)',
    'Last Patient In (LPI)',
    'Last Patient Out (LPO)',
    'Database Lock',
    'Primary Analysis Complete',
    'Clinical Study Report Submitted'
  ];
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  INSERT INTO public.studies (
    protocol_number,
    title,
    phase,
    status,
    therapeutic_area,
    sponsor_name,
    indication,
    target_enrollment,
    planned_start_date,
    planned_end_date,
    actual_start_date,
    created_by,
    owner_user_id
  )
  VALUES (
    p_protocol_number,
    p_title,
    p_phase,
    p_status,
    p_therapeutic_area,
    p_sponsor_name,
    p_indication,
    p_target_enrollment,
    p_planned_start_date,
    p_planned_end_date,
    p_actual_start_date,
    v_user_id,
    v_user_id
  )
  RETURNING * INTO v_study;

  INSERT INTO public.study_team (study_id, user_id, role)
  VALUES (v_study.id, v_user_id, 'owner')
  ON CONFLICT (study_id, user_id) DO UPDATE SET role = 'owner';

  INSERT INTO public.milestones (study_id, name, status)
  SELECT v_study.id, m.name, 'pending'
  FROM unnest(v_milestones) AS m(name);

  RETURN v_study;
END;
$$;

-- Drop the old 13-argument signature that included safety_rules and statistical_plan
DROP FUNCTION IF EXISTS public.create_study_as_owner(
  text, text, text, text, text, text, text, text, text, integer, date, date, date
);

REVOKE ALL ON FUNCTION public.create_study_as_owner(
  text, text, text, text, text, text, text, integer, date, date, date
) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.create_study_as_owner(
  text, text, text, text, text, text, text, integer, date, date, date
) TO authenticated;
