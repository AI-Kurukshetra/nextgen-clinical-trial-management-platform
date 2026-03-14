# CTMS Transformation Plan (Role-Aware, Compliance-Ready, Multi-Module)

## 1. Objective

Upgrade the current app from a module demo into a production-grade CTMS platform with:

- strict role- and site-scoped access
- operational UX for admins, site owners, nurses, investigators, monitors
- financial, scheduling, risk, compliance, integration, and mobile/offline capabilities
- direct mapping to the 23 core features you listed

This plan is designed to **update existing code incrementally** without breaking current modules.

---

## 2. Current Gaps (from existing codebase)

- Global visibility is still too broad in several UI screens.
- Role UX is generic; no true persona-specific workspace.
- Site operations exist, but full site-owner governance and task delegation are incomplete.
- Budgeting/finance, vendor management, integration hub, supply chain, and form builder are not implemented.
- Regulatory/compliance capabilities are partial (audit trail exists, e-signature and Part 11 controls not complete).
- Mobile/offline workflow not implemented.

---

## 3. Product Operating Model (target)

## 3.1 Personas

- **Platform Admin**: portfolio oversight, global configuration, compliance.
- **Study Manager**: study-level execution across sites.
- **Site Owner**: manages one/more sites, members, enrollment execution.
- **Site Admin/Coordinator**: day-to-day site operations.
- **Nurse / Investigator / Doctor**: subject-level tasks and visit/procedure actions.
- **Monitor (CRA)**: monitoring visits, findings, site performance.
- **Viewer/Auditor**: read-only access with traceability.

## 3.2 Scope rules

- User can have multiple memberships across sites/studies.
- Effective permissions = global role privileges + scoped site/study permissions.
- Site clinical data must be scoped by site membership unless user is admin/study_manager.

---

## 4. Technical Architecture Upgrades

## 4.1 Authorization model (must implement first)

- Keep `profiles.role` for global role.
- Add scoped memberships:
  - `site_members` (already added)
  - `study_members` (new: for non-site, study-level delegation)
- Keep bitmask for fast checks, plus role presets for usability.
- Add centralized permission evaluator library used by all route handlers.

## 4.2 UI shell model

- Introduce **role-aware dashboard entrypoints**:
  - `/dashboard/admin`
  - `/dashboard/study-manager`
  - `/dashboard/site-owner`
  - `/dashboard/field`
  - `/dashboard/monitor`
- Sidebar items filtered by effective permissions, not just global role.
- “Why this matters” contextual callouts across key pages.

## 4.3 Data governance + compliance

- Full audit coverage for membership, assignment, status, budget, approvals.
- E-signature model with credential re-confirmation + reason/meaning.
- Soft-delete/versioning patterns where required by regulatory workflows.

---

## 5. Delivery Phases

## Phase A (Foundation hardening, 2-3 weeks)

### A1. Role-based UI segregation
- Build role homepages and route guards.
- Hide admin panel/features from non-admin.
- Site owner view shows only their site-scoped modules and KPIs.

### A2. Permission enforcement completion
- Ensure all APIs enforce effective permissions.
- Add permission matrix tests (admin/study_manager/site_owner/nurse/viewer).
- Add policy simulation endpoint for troubleshooting access issues.

### A3. UX refresh baseline
- Replace remaining native selects with shadcn patterns.
- Standardize forms, helper text, empty states, and glossary cards.

---

## Phase B (Core operations completion, 3-4 weeks)

### B1. Study Planning & Setup (Feature 1)
- Protocol templates, study wizard, startup checklist.
- Better protocol object editing and validation.

### B2. Site Management (Feature 2)
- Site initiation checklist.
- Site owner/member governance (already started) + invitation flow.
- Site performance board (activation lag, enrollment velocity, query burden).

### B3. Enrollment Tracking (Feature 3)
- Real-time enrollment widgets (actual vs plan, by site/time).
- Recruitment analytics and bottleneck indicators.

### B4. Monitoring Visit Management (Feature 8)
- CRA workspace: due visits, overdue reports, findings closure.
- Monitoring findings linked to deviations and CAPA actions.

### B5. Issue & Risk Management (Feature 9)
- `issues` + `risk_register` modules with severity, probability, impact, mitigation owners.
- Escalation workflows and SLA timers.

---

## Phase C (Finance + portfolio + vendors, 3-4 weeks)

### C1. Budget & Financial Management (Feature 5)
- Tables: budgets, cost_centers, invoices, payments, site_payment_runs.
- Per-subject/site payment logic.
- Financial dashboard (planned vs actual burn, forecast variance).

### C2. Timeline & Critical Path (Feature 6)
- Milestone dependencies and critical path computation.
- Delay impact simulation.

### C3. Contact & Vendor Management (Feature 7)
- Investigator directory, vendor registry, contracts, service KPIs.

### C4. Portfolio dashboard expansion (Feature 16)
- Cross-study resourcing, risk heatmap, financial rollups.

---

## Phase D (Compliance, integrations, supply, advanced platform, 4-6 weeks)

### D1. Regulatory docs + versioning + signatures (Features 4, 12, 22)
- Approval workflows with signature meaning/reason.
- Part 11 controls: immutable signature metadata, tamper-evident audit.

### D2. Global compliance framework (Feature 19)
- ICH-GCP/FDA/EMA requirement matrix.
- Compliance checklist engine per study/site.

### D3. Integration Hub (Feature 18)
- Connector framework + job orchestrator:
  - EDC connector
  - eTMF connector
  - Safety system connector
- Retry/dead-letter + mapping screens.

### D4. Supply Chain (Feature 20)
- Drug inventory per depot/site, shipment tracking, threshold alerts.

### D5. Site scorecards (Feature 21)
- Automated ranking: enrollment performance, protocol adherence, visit quality.

### D6. Communication Center (Feature 14)
- Activity feed + task comments + alerting center.

### D7. No-code Form Builder (Feature 23)
- Builder for custom forms, versioned schema storage, runtime rendering.

---

## Phase E (Mobile + offline, 4-5 weeks)

### E1. Mobile app (Feature 17)
- React Native app for field staff/investigators.
- Task queue, subject actions, visit capture.

### E2. Offline architecture
- Local encrypted datastore.
- Sync engine with conflict resolution rules.
- Offline-ready forms and signatures (with deferred verification policies).

---

## 6. Data Model Roadmap (incremental migrations)

### Already added
- `site_members`
- `subject_assignments`

### Next migrations
- `study_members`
- `issues`, `risk_register`, `risk_actions`
- `budgets`, `cost_entries`, `payments`, `site_payment_runs`
- `vendors`, `investigators`, `contracts`
- `signatures` (Part 11-ready extension)
- `integration_connectors`, `integration_runs`, `integration_errors`
- `drug_inventory`, `drug_shipments`
- `custom_forms`, `custom_form_versions`, `custom_form_submissions`

Each migration must include:
- constraints + indexes
- audit logging hooks
- API contract updates
- seed records for demo workflows

---

## 7. UX/UI Strategy

## 7.1 Design principles
- Task-first screens, not table-first.
- Every page answers: what is this, why it matters, what to do next.
- Persona-oriented action cards.
- KPI + alerts above grids.

## 7.2 Role-specific homepages
- **Admin**: portfolio + compliance + finance.
- **Study Manager**: activation, milestones, cross-site bottlenecks.
- **Site Owner**: site ops board, team workload, enrollment.
- **Nurse/Investigator**: assigned subject tasks and due procedures.
- **Monitor**: CRA queue and findings closure.

## 7.3 Guardrails
- Permission-aware action visibility (hide/disable with explanation).
- Explicit “scope chips” (Current scope: Site X / Study Y).
- Destructive actions require reason capture.

---

## 8. Quality, Security, Compliance

- API test matrix for each route: unauth/authz/validation/side effects.
- Contract tests for bitmask permission edge cases.
- Audit integrity checks for critical entities.
- Signature non-repudiation checks for approval flows.
- Performance targets for dashboard queries and portfolio analytics.

---

## 9. Execution Sequence for This Repository (immediate)

## Step 1 (now)
- Finish role-specific dashboard routes and nav gating.
- Enforce site scoping in any remaining APIs/UI pages.
- Add invitation-based site member management (not raw search only).

## Step 2
- Build Issue/Risk module and integrate with deviations/monitoring.
- Expand enrollment analytics and site performance cards.

## Step 3
- Implement budget + payment core with reporting cards.
- Implement vendor/investigator registry.

## Step 4
- Implement signature workflows and compliance evidence UI.
- Start integration hub skeleton and connector contracts.

## Step 5
- Begin mobile app shell + offline sync foundations.

---

## 10. Feature-to-Phase Mapping (your 23 features)

- **Must-have immediate track**: 1,2,3,4,5,6,8,9,10,11,12,13,18,19,22
- **Important track**: 14,15,16,20,21
- **Strategic expansion**: 17,23

Planned completion order:
- Phase A/B covers 1,2,3,8,9,10,11,13,15,16
- Phase C covers 5,6,7,10,16,21
- Phase D covers 4,12,18,19,20,22,14,23
- Phase E covers 17 (+ offline resilience)

---

## 11. Success Criteria

- No cross-site data leakage for scoped users.
- Site owners can fully operate their own site team and subject workflows.
- Admin/study_manager get portfolio, finance, and compliance views.
- Monitoring, issues, and risks are linked in one operational chain.
- Regulatory workflows produce complete audit and signature evidence.
- Field staff can execute key workflows on mobile, including offline scenarios.
