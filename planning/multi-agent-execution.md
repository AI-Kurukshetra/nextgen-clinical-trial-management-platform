# Multi-Agent Execution Blueprint

## Objective
Run parallel delivery safely across disjoint file and module ownership so multiple agents can work simultaneously without merge conflicts.

## Agent topology
- Agent A (Platform Security): authz, RLS, permission evaluators, guards
- Agent B (Clinical Ops): studies/sites/subjects/monitoring/issues/risk UI + APIs
- Agent C (Compliance): documents, signatures, audit trails, rule packs
- Agent D (Finance/Vendors): budgeting, payments, vendor registry, reports
- Agent E (Integrations/Mobile): connector framework, supply chain, mobile/offline
- Agent F (QA/Release): test suites, UAT scripts, performance, hardening

## Ownership map
- Agent A:
  - `src/lib/auth*`, `src/lib/site-permissions*`, `src/app/api/**` policy logic
  - `supabase/migrations/*rls*`, `docs/database.md` (security sections)
- Agent B:
  - `src/app/dashboard/studies/**`, `src/components/ctms/studies/**`, `sites/**`, `subjects/**`, `monitoring/**`
  - `src/hooks/use-studies.ts`, `use-sites.ts`, `use-subjects.ts`, `use-monitoring-visits.ts`
- Agent C:
  - `src/app/api/documents/**`, `signatures/**`, `src/components/ctms/documents/**`
  - `docs/api-contracts.md` (regulatory endpoints)
- Agent D:
  - `src/app/api/budgets/**`, `payments/**`, `vendors/**`
  - `src/components/ctms/finance/**`, `vendors/**`
- Agent E:
  - `src/app/api/integrations/**`, `src/lib/integrations/**`, `mobile/` workspace
- Agent F:
  - `tests/**`, contract/integration suites, release checklists

## Parallel work protocol
1. Freeze schema contracts per sprint before coding.
2. Assign non-overlapping write scopes.
3. Merge order:
   - migrations -> backend APIs -> hooks -> UI -> tests -> docs.
4. Require each agent to ship:
   - code
   - tests
   - docs updates
   - migration safety notes

## CI quality gates per PR
- Typecheck and lint pass
- Contract tests for changed APIs
- Authorization tests for role/site scope
- No unaudited write actions for regulated entities

## Sprint execution template (repeat)
- Planning: scope freeze + ownership assignment
- Build: parallel agent execution
- Integration: conflict resolution + data contract verification
- Validation: UAT + security + performance checks
- Release: migration runbook + rollback plan + seed plan

## Immediate execution order for this repository
- Stage 1 (now): Agent A + B + F
  - complete full role-scoped UI/API enforcement and regression tests
- Stage 2: Agent C + F
  - signatures and compliance workflows
- Stage 3: Agent D + F
  - finance and vendor stack
- Stage 4: Agent E + F
  - integrations, supply, mobile/offline

## Real-world constraints and mitigation
- Constraint: full 23-feature delivery cannot be safely completed in one runtime session.
- Mitigation: execute by gated waves with parallel agents and release checkpoints.
- Constraint: evolving regulatory requirements.
- Mitigation: rule-pack architecture with versioned compliance templates.

## Definition of done (global)
- All must-have features implemented with tested APIs and role-safe UX
- Audit and signature evidence exportable for inspections
- Portfolio + finance + compliance dashboards production ready
- Mobile workflows functional with offline sync and conflict resolution
