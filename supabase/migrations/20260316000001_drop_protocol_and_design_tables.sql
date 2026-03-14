-- Drop Protocol & Design tables and related study columns
-- These features have been removed from the application.

drop table if exists protocol_amendments cascade;
drop table if exists protocol_endpoints cascade;
drop table if exists protocol_objectives cascade;
drop table if exists visit_definitions cascade;
drop table if exists eligibility_criteria cascade;
drop table if exists study_arms cascade;

alter table studies
  drop column if exists safety_rules,
  drop column if exists statistical_plan;
