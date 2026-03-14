-- Sprint 1 protocol/design entities + studies protocol narrative fields

-- Protocol Objectives
create table if not exists public.protocol_objectives (
  id          uuid primary key default gen_random_uuid(),
  study_id    uuid not null references public.studies(id) on delete cascade,
  type        text not null check (type in ('primary','secondary','exploratory')),
  description text not null,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now()
);

-- Eligibility Criteria
create table if not exists public.eligibility_criteria (
  id          uuid primary key default gen_random_uuid(),
  study_id    uuid not null references public.studies(id) on delete cascade,
  type        text not null check (type in ('inclusion','exclusion')),
  criterion   text not null,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now()
);

-- Study Arms
create table if not exists public.study_arms (
  id          uuid primary key default gen_random_uuid(),
  study_id    uuid not null references public.studies(id) on delete cascade,
  name        text not null,
  arm_type    text not null check (arm_type in ('experimental','control','open_label','placebo')),
  description text,
  dose        text,
  route       text,
  frequency   text,
  created_at  timestamptz not null default now()
);

-- Visit Definitions
create table if not exists public.visit_definitions (
  id             uuid primary key default gen_random_uuid(),
  study_id       uuid not null references public.studies(id) on delete cascade,
  name           text not null,
  visit_code     text not null,
  day_target     integer,
  window_before  integer not null default 0,
  window_after   integer not null default 0,
  is_mandatory   boolean not null default true,
  assessments    text[] not null default '{}',
  sort_order     integer not null default 0,
  created_at     timestamptz not null default now(),
  unique (study_id, visit_code)
);

-- Protocol Endpoints
create table if not exists public.protocol_endpoints (
  id          uuid primary key default gen_random_uuid(),
  study_id    uuid not null references public.studies(id) on delete cascade,
  type        text not null check (type in ('primary','secondary','safety','exploratory')),
  description text not null,
  measurement text,
  timepoint   text,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now()
);

-- Protocol Amendments
create table if not exists public.protocol_amendments (
  id             uuid primary key default gen_random_uuid(),
  study_id       uuid not null references public.studies(id) on delete cascade,
  version        text not null,
  amendment_date date not null,
  summary        text not null,
  reason         text,
  document_id    uuid references public.documents(id),
  created_by     uuid references auth.users(id),
  created_at     timestamptz not null default now()
);

-- Studies protocol narrative fields
alter table public.studies
  add column if not exists safety_rules text,
  add column if not exists statistical_plan text;

-- Indexes
create index if not exists idx_objectives_study_id on public.protocol_objectives(study_id);
create index if not exists idx_eligibility_study_id on public.eligibility_criteria(study_id);
create index if not exists idx_arms_study_id on public.study_arms(study_id);
create index if not exists idx_visit_defs_study_id on public.visit_definitions(study_id);
create index if not exists idx_endpoints_study_id on public.protocol_endpoints(study_id);
create index if not exists idx_amendments_study_id on public.protocol_amendments(study_id);
