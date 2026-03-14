# CTMS Blueprint — Full Technical & Functional Specification

> Reference document for the NextGen Clinical Trial Management System.
> Stack: Next.js 16 · Supabase · TanStack Query · shadcn/ui · Zod · React Hook Form

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [User Roles & Permissions](#user-roles--permissions)
3. [Core Modules & Functional Requirements](#core-modules--functional-requirements)
4. [Data Model](#data-model)
5. [Key Workflows](#key-workflows)
6. [API Design](#api-design)
7. [Non-Functional Requirements](#non-functional-requirements)
8. [Compliance Architecture](#compliance-architecture)
9. [Scope Boundaries](#scope-boundaries)
10. [Architectural Decisions](#architectural-decisions)

---

## Executive Summary

Clinical Trial Management Systems (CTMS) are the operational backbone of clinical research. This system covers the full trial lifecycle from study setup through site activation, patient enrollment, monitoring visits, and deviation tracking — targeting the same space as Veeva Vault CTMS for mid-market biotech and CROs.

**Core Value Proposition:**
- Study lifecycle management (setup → active → completed)
- Multi-site enrollment tracking with real-time metrics
- CRA monitoring visit scheduling and completion
- Protocol deviation logging and resolution
- GCP-aligned audit trail for every data mutation

---

## User Roles & Permissions

### Role Hierarchy

```mermaid
graph TD
    ADMIN["🔑 admin\nSystem administrator\nFull access to everything"]
    SM["📋 study_manager\nCRO/Sponsor PM\nCreate & manage studies"]
    MON["🔍 monitor\nClinical Research Associate\nSite visits & deviations"]
    SC["👤 site_coordinator\nSite staff\nSubject data entry"]
    VW["👁 viewer\nSponsor observer\nRead-only access"]

    ADMIN -->|can assign| SM
    ADMIN -->|can assign| MON
    ADMIN -->|can assign| SC
    ADMIN -->|can assign| VW
    SM -->|assigns to study| MON
    SM -->|assigns to study| SC
    SM -->|assigns to study| VW
```

### Permission Matrix

| Action | admin | study_manager | monitor | site_coordinator | viewer |
|---|:---:|:---:|:---:|:---:|:---:|
| Create study | ✓ | ✓ | | | |
| Edit study | ✓ | ✓ (own) | | | |
| Delete study | ✓ | | | | |
| View study | ✓ | ✓ (assigned) | ✓ (assigned) | ✓ (assigned) | ✓ (assigned) |
| Manage study team | ✓ | ✓ (own) | | | |
| Create/edit site | ✓ | ✓ | | | |
| View site | ✓ | ✓ | ✓ | ✓ (own) | ✓ |
| Enroll subject | ✓ | ✓ | ✓ | ✓ (own site) | |
| Update subject status | ✓ | ✓ | ✓ | ✓ (own site) | |
| View subjects | ✓ | ✓ | ✓ | ✓ (own site) | ✓ |
| Create monitoring visit | ✓ | ✓ | ✓ | | |
| Complete monitoring visit | ✓ | ✓ | ✓ (assigned) | | |
| Log deviation | ✓ | ✓ | ✓ | ✓ | |
| Resolve deviation | ✓ | ✓ | ✓ | | |
| Manage milestones | ✓ | ✓ | | | |
| Manage documents | ✓ | ✓ | ✓ | | |
| View audit logs | ✓ | | | | |
| Manage users | ✓ | | | | |

### Role Scoping: Study Team

Access to clinical data (sites, subjects, visits, deviations) is **study-scoped** via the `study_team` table. Users must be explicitly added to a study team to see its data. Admins bypass this check.

```mermaid
graph LR
    USER["User\n(any role)"] -->|member of| ST["study_team\n(study_id, user_id, role)"]
    ST -->|grants access to| S["Study + all\nchild entities"]
    ADMIN["admin role"] -->|bypasses| ST
```

---

## Core Modules & Functional Requirements

### Module 1: Studies

The central entity. Everything in the system belongs to a study.

**States:**

```mermaid
stateDiagram-v2
    [*] --> setup : Create study
    setup --> active : Activate (first site initiated)
    active --> on_hold : Place on hold
    on_hold --> active : Resume
    active --> completed : All objectives met
    active --> terminated : Early termination
    on_hold --> terminated : Terminate while held
    completed --> [*]
    terminated --> [*]
```

**Required fields on creation:**
- Protocol Number (unique, e.g. `PROTO-2026-001`)
- Title
- Phase (Phase I / II / III / IV / Observational)
- Therapeutic Area
- Sponsor Name
- Indication
- Target Enrollment (integer)
- Planned Start Date
- Planned End Date

**Study Detail Hub** (tabbed page at `/dashboard/studies/[id]`):
- **Overview** — key metrics cards, enrollment progress, upcoming milestones
- **Sites** — sites table with status, enrollment counts
- **Subjects** — cross-site subject roster
- **Monitoring** — visit schedule and history
- **Deviations** — deviation log
- **Milestones** — timeline with planned vs actual
- **Documents** — document registry

---

### Module 2: Sites

Clinical research sites conducting the trial.

**States:**

```mermaid
stateDiagram-v2
    [*] --> identified : Add to study
    identified --> selected : Site selected
    selected --> initiated : Site Initiation Visit completed
    initiated --> active : First patient screened
    active --> closed : All subjects completed/withdrawn
    active --> terminated : Early termination
    selected --> terminated : Site dropped
    closed --> [*]
    terminated --> [*]
```

**Key fields:**
- Site Number (unique within study, e.g. `001`)
- Name, City, Country
- Principal Investigator name + email
- Target Enrollment
- Enrolled Count (auto-maintained by trigger)
- Screen Failures (auto-maintained by trigger)
- Initiated Date, Closed Date

**Site Detail** shows:
- Enrollment gauge (enrolled / target)
- Next scheduled monitoring visit
- Open deviations count by severity
- Active subjects list

---

### Module 3: Subject Enrollment

Patient tracking with full GCP pseudonymization compliance.

**Subject Number Format:** `{site_number}-{sequence}` (e.g., `001-003` = Site 001, Subject 3)

**States:**

```mermaid
stateDiagram-v2
    [*] --> screened : Screen subject
    screened --> enrolled : Pass screening
    screened --> screen_failed : Fail screening
    enrolled --> active : Baseline visit completed
    active --> completed : All visits done
    active --> withdrawn : Subject withdraws
    active --> lost_to_followup : Cannot contact
    completed --> [*]
    withdrawn --> [*]
    screen_failed --> [*]
    lost_to_followup --> [*]
```

**Privacy Rules (GCP Compliance):**
- Store `subject_number` (site-subject code) and `initials` only
- No full names, date of birth, address, or contact info in this table
- Link to EDC system (future) for clinical data

**Enrollment Trigger (Postgres):**
When `subjects.status` changes, automatically recalculates:
- `sites.enrolled_count` = subjects where status NOT IN ('screened', 'screen_failed')
- `sites.screen_failures` = subjects where status = 'screen_failed'

---

### Module 4: Monitoring Visits

CRA site visits — the primary GCP oversight mechanism.

**Visit Types:**
| Code | Full Name | Description |
|---|---|---|
| SIV | Site Initiation Visit | First visit to train site staff |
| IMV | Interim Monitoring Visit | Routine ongoing monitoring |
| COV | Close-Out Visit | Final visit to close site |
| Remote | Remote Visit | Off-site review |
| For_Cause | For-Cause Visit | Triggered by issue/risk |

**States:**

```mermaid
stateDiagram-v2
    [*] --> scheduled : Schedule visit
    scheduled --> in_progress : Visit starts
    scheduled --> cancelled : Cancel visit
    in_progress --> completed : Submit report
    cancelled --> scheduled : Reschedule
    completed --> [*]
```

**Overdue Logic:**
A visit is flagged overdue when `planned_date < today` AND `status = 'scheduled'`.

**Completion captures:**
- Actual Date
- Subjects Reviewed (count)
- Findings Summary (text)
- Report Due Date (auto: actual_date + 10 calendar days)

---

### Module 5: Protocol Deviations

Tracking non-compliance events for regulatory reporting.

**Categories:**
`protocol` | `gcp` | `informed_consent` | `ip_handling` | `eligibility` | `visit_window` | `other`

**Severity Levels:**

```mermaid
graph LR
    MINOR["minor\n🟡 Yellow\nUnlikely to affect\nsubject safety or\ndata integrity"]
    MAJOR["major\n🟠 Orange\nMay impact data\nintegrity or subject\nrights"]
    CRITICAL["critical\n🔴 Red\nEndangers subject\nsafety or seriously\naffects data quality"]
```

**States:**

```mermaid
stateDiagram-v2
    [*] --> open : Log deviation
    open --> under_review : Begin review
    under_review --> resolved : Add root cause + CAPA
    resolved --> closed : QA sign-off
    open --> closed : Minor, no CAPA needed
    closed --> [*]
```

**Deviation Number Format:** `DEV-{protocol_number}-{YYYY}-{seq:03d}`
Example: `DEV-PROTO-2026-001-007`

**Resolution requires:**
- Root Cause (text)
- Corrective and Preventive Action (CAPA)
- Resolved Date

---

### Module 6: Milestones

Study timeline management.

**Standard milestones auto-created with each new study:**
1. Protocol Finalized
2. IRB/Ethics Approval Received
3. First Site Initiated (FSI)
4. First Patient In (FPI)
5. Last Patient In (LPI)
6. Last Patient Out (LPO)
7. Database Lock
8. Primary Analysis Complete
9. Clinical Study Report Submitted

**Status auto-logic:**
- `at_risk` — planned_date within 14 days AND status = 'pending'
- `missed` — planned_date < today AND status = 'pending'
- `completed` — actual_date is set

```mermaid
stateDiagram-v2
    [*] --> pending : Create milestone
    pending --> at_risk : planned_date within 14 days
    at_risk --> pending : Date extended
    pending --> completed : Set actual_date
    at_risk --> completed : Set actual_date
    pending --> missed : planned_date passed
    at_risk --> missed : planned_date passed
    missed --> completed : Set actual_date (late)
    completed --> [*]
```

---

### Module 7: Documents

Document registry with metadata tracking (file upload deferred to Week 1).

**Document Types:**
`protocol` | `icf` | `investigator_brochure` | `regulatory_submission` | `monitoring_report` | `deviation_report` | `other`

**Version States:**
`draft → under_review → approved → superseded`

**Day 1 scope:** Store metadata only. `file_url` column exists but is empty. Upload button shows "Coming soon."

---

### Module 8: Portfolio Dashboard

The command center for study managers and monitors.

**Study Manager view — metric cards:**
- Total Active Studies
- Total Sites (across all studies)
- Total Subjects Enrolled
- Open Deviations (critical + major highlighted)

**Enrollment table per study:**
- Protocol #, Study Title, Phase, Sites Active, Enrolled, Target, % Complete (progress bar)

**Upcoming Monitoring Visits (next 14 days):**
- Visit Type, Site, Study, Monitor, Planned Date

**Open Deviations by Severity:**
- Critical count (red), Major count (orange), Minor count (yellow)

**Monitor view** — shows only their assigned studies and their personal visit queue.

**Site Coordinator view** — shows only their site's metrics and subject list.

---

## Data Model

### Complete Entity Relationship Diagram

```mermaid
erDiagram
    profiles {
        uuid id PK
        text email
        text full_name
        text avatar_url
        text role
        timestamptz created_at
        timestamptz updated_at
    }

    studies {
        uuid id PK
        text protocol_number UK
        text title
        text phase
        text status
        text therapeutic_area
        text sponsor_name
        text indication
        int target_enrollment
        date planned_start_date
        date planned_end_date
        date actual_start_date
        uuid created_by FK
        timestamptz created_at
        timestamptz updated_at
    }

    study_team {
        uuid id PK
        uuid study_id FK
        uuid user_id FK
        text role
        timestamptz created_at
    }

    sites {
        uuid id PK
        uuid study_id FK
        text site_number
        text name
        text city
        text country
        text status
        text principal_investigator_name
        text principal_investigator_email
        int target_enrollment
        int enrolled_count
        int screen_failures
        date initiated_date
        date closed_date
        timestamptz created_at
        timestamptz updated_at
    }

    subjects {
        uuid id PK
        uuid study_id FK
        uuid site_id FK
        text subject_number UK
        text initials
        text status
        date screen_date
        date enrollment_date
        date completion_date
        text withdrawal_reason
        timestamptz created_at
        timestamptz updated_at
    }

    monitoring_visits {
        uuid id PK
        uuid study_id FK
        uuid site_id FK
        uuid monitor_id FK
        text visit_type
        text status
        date planned_date
        date actual_date
        int subjects_reviewed
        text findings_summary
        date report_due_date
        timestamptz created_at
        timestamptz updated_at
    }

    deviations {
        uuid id PK
        uuid study_id FK
        uuid site_id FK
        uuid subject_id FK
        text deviation_number
        text category
        text description
        text severity
        text status
        date reported_date
        date resolved_date
        text root_cause
        text corrective_action
        uuid created_by FK
        timestamptz created_at
        timestamptz updated_at
    }

    milestones {
        uuid id PK
        uuid study_id FK
        text name
        date planned_date
        date actual_date
        text status
        timestamptz created_at
        timestamptz updated_at
    }

    documents {
        uuid id PK
        uuid study_id FK
        uuid site_id FK
        text name
        text doc_type
        text version
        text status
        text file_url
        uuid uploaded_by FK
        timestamptz created_at
        timestamptz updated_at
    }

    audit_logs {
        bigserial id PK
        text table_name
        uuid record_id
        text action
        jsonb old_data
        jsonb new_data
        uuid performed_by FK
        timestamptz performed_at
    }

    profiles ||--o{ study_team : "assigned to"
    profiles ||--o{ studies : "created by"
    profiles ||--o{ monitoring_visits : "assigned as monitor"
    profiles ||--o{ deviations : "created by"
    profiles ||--o{ documents : "uploaded by"
    profiles ||--o{ audit_logs : "performed by"

    studies ||--o{ study_team : "has team"
    studies ||--o{ sites : "conducted at"
    studies ||--o{ subjects : "enrolls"
    studies ||--o{ monitoring_visits : "has visits"
    studies ||--o{ deviations : "tracks deviations"
    studies ||--o{ milestones : "tracks milestones"
    studies ||--o{ documents : "has documents"

    sites ||--o{ subjects : "enrolls at site"
    sites ||--o{ monitoring_visits : "receives visits"
    sites ||--o{ deviations : "reports from"
    sites ||--o{ documents : "site documents"

    subjects ||--o{ deviations : "subject involved in"
```

---

## Key Workflows

### Study Setup Flow

```mermaid
flowchart TD
    A([Study Manager logs in]) --> B[Create New Study\nProtocol #, Title, Phase, etc.]
    B --> C[System auto-creates\n9 standard milestones]
    C --> D[Add Sites to Study]
    D --> E[Assign Study Team\nMonitors + Coordinators]
    E --> F[Schedule Site Initiation Visits]
    F --> G{SIV Completed?}
    G -->|Yes| H[Set Site Status → initiated]
    H --> I[Site Coordinator\nenrolls first subject]
    I --> J[Site Status → active\nStudy Status → active]
    J --> K([Study Running])
```

### Subject Enrollment Flow

```mermaid
flowchart TD
    A([Site Coordinator]) --> B[Open Study > Site > Subjects]
    B --> C[Click Enroll New Subject]
    C --> D[Fill form:\nSubject #, Initials, Screen Date]
    D --> E[Status = screened]
    E --> F{Screening\nOutcome?}
    F -->|Pass| G[Update Status → enrolled\nSet Enrollment Date]
    F -->|Fail| H[Update Status → screen_failed\nSite screen_failures + 1]
    G --> I[sites.enrolled_count + 1\nvia Postgres trigger]
    G --> J[Baseline visit → Status: active]
    J --> K{End of Trial?}
    K -->|All visits done| L[Status → completed]
    K -->|Subject exits| M[Status → withdrawn\nor lost_to_followup\nSet withdrawal_reason]
    L --> N([Subject record closed])
    M --> N
```

### Monitoring Visit Flow

```mermaid
flowchart TD
    A([Study Manager / Monitor]) --> B[Navigate to Study > Monitoring]
    B --> C[Schedule Visit\nSite, Type, Monitor, Planned Date]
    C --> D[Status = scheduled\nMonitor notified in-app]
    D --> E{Visit Day}
    E --> F[Monitor starts visit\nStatus → in_progress]
    F --> G[Review subjects, source docs,\nregulatory binder]
    G --> H[Complete Visit Form:\nActual Date, Subjects Reviewed,\nFindings Summary]
    H --> I[Status → completed\nReport Due Date = +10 days]
    I --> J{Findings\nrequire action?}
    J -->|Yes| K[Log Deviations\nfrom visit findings]
    J -->|No| L([Visit closed])
    K --> L
    D --> M{Overdue Check}
    M -->|planned_date passed,\nstill scheduled| N[Red overdue flag\nin visit list]
```

### Deviation Resolution Flow

```mermaid
flowchart TD
    A([Monitor / Site Coordinator]) --> B[Navigate to Study > Deviations]
    B --> C[Log New Deviation\nSite, Category, Description,\nSeverity, Subject optional]
    C --> D[System assigns deviation number\nDEV-PROTO-YYYY-NNN]
    D --> E[Status = open]
    E --> F{Severity?}
    F -->|Critical| G[Immediate review flag\nAdmin notified]
    F -->|Major/Minor| H[Normal review queue]
    G --> I[Status → under_review]
    H --> I
    I --> J[Study Manager adds\nRoot Cause + CAPA]
    J --> K[Status → resolved\nSet resolved_date]
    K --> L[QA review]
    L --> M[Status → closed]
    M --> N([Deviation closed\nAudit log entry written])
```

### Audit Trail Flow (21 CFR Part 11)

```mermaid
flowchart LR
    A["User action\n(create/update/delete)"] --> B["API Route Handler"]
    B --> C["Supabase write\n(INSERT/UPDATE/DELETE)"]
    B --> D["insertAuditLog()\ncalled after DB write"]
    D --> E["audit_logs INSERT:\ntable_name, record_id,\naction, old_data, new_data,\nperformed_by, performed_at"]
    E --> F["Immutable record\n(no UPDATE/DELETE on audit_logs)"]
```

---

## API Design

### Route Map

```mermaid
graph LR
    subgraph Studies
        S1["GET /api/studies"]
        S2["POST /api/studies"]
        S3["GET /api/studies/:id"]
        S4["PUT /api/studies/:id"]
        S5["DELETE /api/studies/:id"]
    end

    subgraph Sites
        SI1["GET /api/sites?study_id="]
        SI2["POST /api/sites"]
        SI3["GET /api/sites/:id"]
        SI4["PUT /api/sites/:id"]
    end

    subgraph Subjects
        SU1["GET /api/subjects?study_id=&site_id="]
        SU2["POST /api/subjects"]
        SU3["PUT /api/subjects/:id"]
    end

    subgraph MonitoringVisits
        MV1["GET /api/monitoring-visits?study_id="]
        MV2["POST /api/monitoring-visits"]
        MV3["PUT /api/monitoring-visits/:id"]
    end

    subgraph Deviations
        D1["GET /api/deviations?study_id="]
        D2["POST /api/deviations"]
        D3["PUT /api/deviations/:id"]
    end

    subgraph Milestones
        MI1["GET /api/milestones?study_id="]
        MI2["POST /api/milestones"]
        MI3["PUT /api/milestones/:id"]
    end
```

### Standard Response Envelope

All API routes use the existing typed response pattern from `src/types/api.ts`:

```typescript
// Success
{ success: true, data: T, message?: string, metadata?: { pagination?: {...} } }

// Error
{ success: false, error: { code?: string, message: string }, details?: unknown }
```

### Audit Log Helper

Every mutation API route calls this after the DB write:

```typescript
async function insertAuditLog(supabase, {
  tableName: string,
  recordId: string,
  action: 'INSERT' | 'UPDATE' | 'DELETE',
  oldData?: Record<string, unknown>,
  newData?: Record<string, unknown>,
  performedBy: string
})
```

---

## Non-Functional Requirements

### Security

| Requirement | Implementation |
|---|---|
| Authentication | Supabase Auth JWT, refreshed by middleware on every request |
| Authorization | RLS on every table (defense in depth: enforced even if API layer fails) |
| Study-scoped access | `study_team` join table; no data visible outside team membership |
| Input validation | Zod schemas on every API route + form |
| No PII in subjects | Subject number + initials only; no names, DOB, or contact info |
| Admin elevation | Role stored in `profiles.role`, checked by RLS and `RoleGuard` component |

### Performance

| Target | Implementation |
|---|---|
| List pages < 200ms | Indexed foreign keys on every FK column |
| Study detail < 300ms | Parallel data fetching with TanStack Query |
| Enrollment counts | Denormalized on `sites` table via trigger (no COUNT queries on hot paths) |
| Pagination | TanStack Table handles client-side pagination; API returns full dataset per study |

### Data Integrity

| Requirement | Implementation |
|---|---|
| `updated_at` maintenance | Postgres trigger `set_updated_at()` on all tables |
| Referential integrity | FK constraints with `ON DELETE CASCADE` (study deleted → all child data deleted) |
| Unique subject numbers | `UNIQUE(study_id, subject_number)` constraint |
| Unique site numbers | `UNIQUE(study_id, site_number)` constraint |
| Unique protocol numbers | `UNIQUE` on `studies.protocol_number` |

---

## Compliance Architecture

### 21 CFR Part 11 Coverage Map

| Requirement | Status | Implementation |
|---|---|---|
| Audit trail (who, what, when) | **Day 1** | `audit_logs` table, written by API routes |
| User authentication | **Done** | Supabase Auth, email verification |
| Role-based access control | **Day 1** | 5-role RBAC with RLS |
| Data integrity / no unauthorized modification | **Day 1** | RLS policies, FK constraints |
| Unique user identification | **Done** | `auth.uid()` tracked everywhere |
| Electronic signatures | **Deferred** | Week 1 — approval workflows |
| System validation documentation | **Deferred** | Future — IQ/OQ/PQ docs |

### GCP Compliance Coverage Map

| ICH-GCP Element | Status | Implementation |
|---|---|---|
| Subject pseudonymization | **Day 1** | Subject # + initials only |
| Site monitoring records | **Day 1** | Monitoring visits module |
| Protocol deviation tracking | **Day 1** | Deviations module |
| Investigator oversight | **Day 1** | PI name on site record |
| Trial master file | **Deferred** | Documents module (metadata Day 1, upload Week 1) |
| Informed consent tracking | **Deferred** | ICF document + subject link Week 1 |

---

## Scope Boundaries

### Day 1 — Shippable MVP

| Module | Scope |
|---|---|
| Auth + RBAC | 5 roles, study-team scoping |
| Studies | Full CRUD, status lifecycle |
| Sites | Full CRUD, status lifecycle, enrollment counts |
| Subjects | Enrollment, status transitions, pseudonymized |
| Monitoring Visits | Schedule, complete, overdue flags |
| Deviations | Log, review, resolve, close |
| Milestones | Auto-create 9 standard, planned/actual dates |
| Documents | Metadata only, no file upload |
| Dashboard | Enrollment metrics, upcoming visits, open deviations |
| Audit Logs | Written on every mutation (no UI) |

### Week 1 Extensions

| Feature | Complexity | Notes |
|---|---|---|
| Document file upload | Medium | Supabase Storage + signed URLs |
| Email notifications | Low | Resend integration for overdue visits, new deviations |
| Audit log viewer UI | Low | Admin table showing audit_logs |
| Study team management UI | Medium | Add/remove team members from study |
| Deviation PDF export | Low | Browser print stylesheet |
| Enrollment forecasting | Medium | Linear projection chart from current rate |
| Password reset | Low | Supabase `resetPasswordForEmail` |

### Future (Post-Week 1)

| Feature | Why Deferred | Substitute on Day 1 |
|---|---|---|
| Electronic signatures (21 CFR Part 11) | Requires signature capture, legal workflow, identity binding | "Approved by [name] at [timestamp]" text label |
| EDC integration | External API contract + auth + webhook infrastructure | Manual subject count entry |
| eTMF integration | Separate Veeva product; complex document sync | Local document metadata table |
| Budget & financials | Per-visit payment calculation is a product in itself | Not included |
| Mobile app (React Native) | Separate build pipeline | Responsive web works on tablet |
| AI enrollment prediction | Requires historical data + Claude API | Static progress bars |
| Adaptive trial management | Complex regulatory workflow | Not applicable to MVP |
| Blockchain audit trail | Overkill for MVP; no buyer asks for it | Postgres audit_logs is GCP-sufficient |

---

## Architectural Decisions

### Decision 1: Role stored in `profiles.role`, not separate table

**Rationale:** Simplicity. A role-per-user-per-study (full RBAC) would require a separate `user_roles` table and complex RLS joins. The current design uses `profiles.role` for system-level capability and `study_team.role` for study-level scoping. This covers all Day 1 use cases.

**Trade-off:** A monitor can't be a study_manager on one study and a viewer on another. Acceptable for MVP.

### Decision 2: `enrolled_count` denormalized on `sites`

**Rationale:** Enrollment progress is shown everywhere (dashboard, site list, study overview). Running `COUNT()` on every render causes N+1 problems. A Postgres trigger maintains accuracy automatically.

**Trade-off:** Trigger adds write complexity. Risk is low — triggers are atomic with the parent write.

### Decision 3: API routes over direct Supabase client calls from Server Components

**Rationale:** Follows existing project pattern. API routes allow: (1) audit log injection on every mutation, (2) consistent authorization checks, (3) typed response envelope, (4) TanStack Query cache compatibility. Server Components calling Supabase directly would bypass the audit trail.

### Decision 4: Milestones auto-created, not templated

**Rationale:** Every Phase II+ trial has the same 9 standard milestones. Auto-creating them at study creation time saves setup friction. Users edit planned dates rather than creating from scratch.

### Decision 5: Subjects are study-scoped, not site-scoped for the primary key

**Rationale:** Subjects can theoretically transfer between sites. `subject_number` is unique per study (`UNIQUE(study_id, subject_number)`), and `site_id` is a foreign key that can be updated. This matches how Veeva and most CTMS systems handle it.
