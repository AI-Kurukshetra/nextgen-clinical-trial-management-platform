-- Add new columns for form improvements.

-- studies: CRO partner and regulatory reference (IND/CTA number)
ALTER TABLE public.studies
  ADD COLUMN IF NOT EXISTS cro_partner text,
  ADD COLUMN IF NOT EXISTS regulatory_reference text;

-- sites: full address fields, IRB info, PI phone
ALTER TABLE public.sites
  ADD COLUMN IF NOT EXISTS address text,
  ADD COLUMN IF NOT EXISTS state text,
  ADD COLUMN IF NOT EXISTS postal_code text,
  ADD COLUMN IF NOT EXISTS irb_number text,
  ADD COLUMN IF NOT EXISTS irb_approval_date date,
  ADD COLUMN IF NOT EXISTS principal_investigator_phone text;

-- subjects: screen failure reason (separate from withdrawal reason)
ALTER TABLE public.subjects
  ADD COLUMN IF NOT EXISTS screen_failure_reason text;
