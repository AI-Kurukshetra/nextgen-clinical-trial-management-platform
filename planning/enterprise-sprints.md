# Enterprise CTMS Delivery Plan (Real-World)

## Delivery principles
- Compliance-first architecture (ICH-GCP, FDA, EMA, 21 CFR Part 11)
- Role-scoped access at global, study, and site levels
- Backward-compatible migrations with auditability
- API contracts + integration tests required per sprint
- Production readiness gates before rollout

## Program timeline
- Program length: 32 sprints
- Sprint cadence: 1 week
- Release train: every 4 sprints
- Tracks run in parallel: Platform, Clinical Ops, Compliance, Finance, Integrations, Mobile

---

## Wave 1: Security + Role Foundations (Sprints 1-6)

### Sprint 1: Authorization Core Hardening
- Scope:
  - Unify permission evaluation library for all APIs
  - Enforce site/study scoping in all read/write routes
- Deliverables:
  - Shared `effective_permissions` utilities
  - Contract tests for forbidden/allowed matrix
- Exit criteria:
  - Zero unauthorized cross-site data access in automated tests

### Sprint 2: Role-Segregated UX Shell
- Scope:
  - Persona home pages: admin, study manager, site owner, field user, monitor
  - Permission-aware nav and action visibility
- Deliverables:
  - New dashboard entry routes
  - Role-based sidebar and route guards
- Exit criteria:
  - Non-admin cannot access admin UX or API operations

### Sprint 3: Membership Governance
- Scope:
  - Study/site membership lifecycle (invite, activate, suspend, remove)
  - Role presets + bitmask editor
- Deliverables:
  - Membership APIs + UI governance panel
  - Audit logging of all membership changes
- Exit criteria:
  - Site owner can manage only own site users

### Sprint 4: Task Assignment Model
- Scope:
  - Subject-task assignment engine to nurses/doctors/coordinators
  - Assignment queue views by user role
- Deliverables:
  - Assignment APIs, UI panels, filters
- Exit criteria:
  - Assigned user sees only assigned tasks

### Sprint 5: Risk Boundary Test Sprint
- Scope:
  - Full authz penetration tests + policy simulation diagnostics
- Deliverables:
  - Security test suite + troubleshooting UI
- Exit criteria:
  - No critical authz defects

### Sprint 6: Production Access Controls Readiness
- Scope:
  - Re-introduce table-level RLS policies safely
  - API + RLS dual enforcement validation
- Deliverables:
  - RLS migration pack + verification scripts
- Exit criteria:
  - RLS enabled with green policy matrix

---

## Wave 2: Clinical Operations Excellence (Sprints 7-14)

### Sprint 7: Study Planning Wizard
- Scope:
  - Study creation wizard with protocol templates and checklist
- Exit criteria:
  - New study setup time reduced by 40%

### Sprint 8: Site Initiation Workbench
- Scope:
  - Site startup checklist, initiation milestones, activation blockers
- Exit criteria:
  - Site startup KPIs visible and actionable

### Sprint 9: Enrollment Intelligence
- Scope:
  - Recruitment funnel analytics, plan-vs-actual enrollment, velocity trends
- Exit criteria:
  - Real-time enrollment dashboard per site and study

### Sprint 10: Monitoring (CRA) Command Center
- Scope:
  - Due/overdue visits, findings closure SLA, report completeness
- Exit criteria:
  - CRA workload and overdue risks visible in one screen

### Sprint 11: Issue Register
- Scope:
  - Issue creation, triage, owner assignment, escalation matrix
- Exit criteria:
  - Every open issue has owner + due date + severity

### Sprint 12: Risk Register + Mitigation
- Scope:
  - Probability/impact scoring and linked mitigation plans
- Exit criteria:
  - Risk heatmap with trend indicators

### Sprint 13: Site Scorecards v1
- Scope:
  - Benchmark sites by enrollment, quality, visit findings, deviation rates
- Exit criteria:
  - Top/bottom site ranking with drilldown

### Sprint 14: Clinical Ops Release Hardening
- Scope:
  - Integration tests, role-based UAT, performance tuning
- Exit criteria:
  - Clinical ops release approved for production

---

## Wave 3: Regulatory + Document Control (Sprints 15-20)

### Sprint 15: Regulatory Repository
- Scope:
  - Structured repository for submissions, approvals, renewals

### Sprint 16: Document Workflow Engine
- Scope:
  - Review/approval states, assignment, SLA notifications

### Sprint 17: Version Control + Traceability
- Scope:
  - Immutable version history, supersede rules, diff metadata

### Sprint 18: Electronic Signatures (Part 11)
- Scope:
  - Credential reconfirmation, reason/meaning, signed hash evidence

### Sprint 19: Compliance Rule Packs (ICH/FDA/EMA)
- Scope:
  - Rule matrix and compliance checklist automation

### Sprint 20: Compliance Release Gate
- Scope:
  - Validation package, audit evidence exports, SOP checks

---

## Wave 4: Finance + Vendor + Portfolio (Sprints 21-26)

### Sprint 21: Budget Setup + Baselines
### Sprint 22: Cost Tracking + Payment Processing
### Sprint 23: Financial Reporting + Forecasting
### Sprint 24: Vendor/Investigator Registry + Contracts
### Sprint 25: Multi-Study Portfolio Resource View
### Sprint 26: Finance/Vendor Production Gate

Exit criteria for Wave 4:
- Planned vs actual burn with variance explanation
- Site payment runs auditable and exportable

---

## Wave 5: Integration + Supply + Mobile + Forms (Sprints 27-32)

### Sprint 27: Integration Hub Core
- Connector framework, run logs, retry/dead-letter queues

### Sprint 28: EDC/eTMF/Safety Connectors v1
- Standard mappers + reconciliation UI

### Sprint 29: Supply Chain Management
- Drug inventory, shipments, expiry/threshold alerts

### Sprint 30: Mobile App Shell + Offline Sync Engine
- Field workflows for investigators/CRAs with offline queue

### Sprint 31: No-Code Form Builder
- Form schema designer + runtime + versioned submissions

### Sprint 32: Program Final Hardening + Go-Live
- Non-functional testing, SRE runbooks, disaster recovery drills

---

## Non-functional requirements (all sprints)
- Security: least privilege, token/session hardening, audit completeness
- Reliability: idempotent writes, retry policies, back-pressure safe jobs
- Performance: p95 API < 500ms for core list operations at target load
- Observability: structured logs, metrics, trace IDs, alert runbooks
- Data quality: validation + referential integrity + reconciliation jobs

## Production readiness gates
- Gate A (after Sprint 6): Access model + RLS certified
- Gate B (after Sprint 14): Clinical operations readiness
- Gate C (after Sprint 20): Compliance and signature certification
- Gate D (after Sprint 26): Finance and vendor controls
- Gate E (after Sprint 32): Full enterprise go-live
