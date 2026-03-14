# NextGen CTMS — Clinical Trial Management System

A modern, open-source Clinical Trial Management System built on **Next.js 16 + Supabase**, designed to rival Veeva Vault CTMS for mid-market biotech and pharmaceutical companies.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.1.6 (App Router) |
| Language | TypeScript 5 |
| Database | PostgreSQL via Supabase |
| Auth | Supabase Auth (email/password) |
| ORM / Query | Supabase JS client + TanStack Query v5 |
| UI Components | shadcn/ui + Tailwind CSS v4 |
| Forms | React Hook Form + Zod |
| Tables | TanStack Table v8 |
| HTTP Client | Axios |
| Icons | Lucide React |
| Toasts | Sonner |
| Date Utils | date-fns |

---

## System Architecture

```mermaid
graph TB
    subgraph Client ["Client (Browser)"]
        UI["Next.js App Router\nReact 19 + shadcn/ui"]
        RHF["React Hook Form\n+ Zod Validation"]
        TQ["TanStack Query\nServer State Cache"]
        AX["Axios API Client"]
    end

    subgraph Server ["Next.js Server (Edge/Node)"]
        MW["Middleware\nAuth Session Refresh"]
        AR["App Router\nServer Components"]
        API["API Routes\n/api/*"]
        AU["Auth Helpers\n@supabase/ssr"]
    end

    subgraph Supabase ["Supabase (Backend)"]
        SA["Supabase Auth\nJWT Sessions"]
        PG["PostgreSQL\nRLS Enforced"]
        ST["Storage\nDocuments (Week 1)"]
        RT["Realtime\n(Future)"]
    end

    UI --> TQ --> AX --> API
    UI --> AR
    MW --> SA
    API --> AU --> PG
    AR --> AU --> PG
    PG --> ST
```

---

## Application Modules

```mermaid
graph LR
    DASH["Portfolio Dashboard\n/dashboard"]

    DASH --> STU["Studies\n/dashboard/studies"]
    DASH --> MON["My Visits\n/dashboard/monitoring"]

    STU --> SD["Study Detail\n[id]"]
    SD --> SITES["Sites"]
    SD --> SUBJ["Subjects"]
    SD --> MV["Monitoring Visits"]
    SD --> DEV["Deviations"]
    SD --> MILE["Milestones"]
    SD --> DOCS["Documents"]

    SITES --> SITE_D["Site Detail\n[siteId]"]
    SITE_D --> SITE_SUBJ["Site Subjects"]
    SITE_D --> SITE_MV["Site Visits"]
    SITE_D --> SITE_DEV["Site Deviations"]
```

---

## User Roles & Access

```mermaid
graph TD
    subgraph Roles
        ADMIN["admin\nFull system access"]
        SM["study_manager\nCreate/manage studies"]
        MON["monitor\nSite visits + deviations"]
        SC["site_coordinator\nSubject data entry"]
        VW["viewer\nRead-only"]
    end

    ADMIN -->|manages| SM
    ADMIN -->|manages| MON
    ADMIN -->|manages| SC
    ADMIN -->|manages| VW
    SM -->|assigns| MON
    SM -->|assigns| SC
```

| Role | Studies | Sites | Subjects | Monitoring Visits | Deviations | Admin |
|---|---|---|---|---|---|---|
| `admin` | Full CRUD | Full CRUD | Full CRUD | Full CRUD | Full CRUD | Yes |
| `study_manager` | Create + manage assigned | Full CRUD | Full CRUD | Full CRUD | Full CRUD | No |
| `monitor` | View assigned | View assigned | View assigned | Create + complete | Create + resolve | No |
| `site_coordinator` | View assigned | View own site | Create + update | View | Create | No |
| `viewer` | View assigned | View assigned | View assigned | View | View | No |

---

## Database Schema Overview

```mermaid
erDiagram
    profiles {
        uuid id PK
        text email
        text full_name
        text role
        timestamptz created_at
        timestamptz updated_at
    }

    studies {
        uuid id PK
        text protocol_number
        text title
        text phase
        text status
        text therapeutic_area
        text sponsor_name
        int target_enrollment
        date planned_start_date
        date planned_end_date
        uuid created_by FK
    }

    study_team {
        uuid id PK
        uuid study_id FK
        uuid user_id FK
        text role
    }

    sites {
        uuid id PK
        uuid study_id FK
        text site_number
        text name
        text country
        text status
        text principal_investigator_name
        int target_enrollment
        int enrolled_count
        int screen_failures
    }

    subjects {
        uuid id PK
        uuid study_id FK
        uuid site_id FK
        text subject_number
        text initials
        text status
        date screen_date
        date enrollment_date
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
    }

    deviations {
        uuid id PK
        uuid study_id FK
        uuid site_id FK
        uuid subject_id FK
        text deviation_number
        text category
        text severity
        text status
        date reported_date
    }

    milestones {
        uuid id PK
        uuid study_id FK
        text name
        date planned_date
        date actual_date
        text status
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

    profiles ||--o{ study_team : "is member of"
    studies ||--o{ study_team : "has team"
    studies ||--o{ sites : "contains"
    studies ||--o{ subjects : "enrolls"
    studies ||--o{ monitoring_visits : "has"
    studies ||--o{ deviations : "tracks"
    studies ||--o{ milestones : "tracks"
    studies ||--o{ documents : "stores"
    sites ||--o{ subjects : "enrolls"
    sites ||--o{ monitoring_visits : "receives"
    sites ||--o{ deviations : "reports"
    subjects ||--o{ deviations : "associated with"
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- Docker + Docker Compose (for MinIO local object storage)
- A Supabase project ([supabase.com](https://supabase.com))

### Setup

```bash
# 1. Clone and install
git clone <repo>
cd NextJS-Supabase
npm install

# 2. Configure environment
cp .env.example .env.local
# Fill in your Supabase URL, anon key, and MinIO credentials (defaults pre-filled)

# 3. Start MinIO (S3-compatible object storage for document uploads)
docker compose up -d
# MinIO S3 API  → http://localhost:9000
# MinIO Console → http://localhost:9001  (minioadmin / minioadmin123)
# Buckets auto-created: ctms-documents, ctms-signatures

# 4. Run the database migrations (Supabase CLI)
npx supabase login
npx supabase init
npx supabase link --project-ref btyegkygtvotuaxjjzgl
npx supabase db push

# 5. Start the dev server
npm run dev
```

### Local Runtime Contract (for all agents)

- The app is expected to run on `http://localhost:3000`.
- For each sprint/API change, the agent must test every created/updated API route before handoff:
  - unauthenticated access behavior (`401`/`403`)
  - authenticated success path
  - validation/error path
  - DB side effects and RLS behavior where relevant
- Do not mark a sprint complete without API verification evidence.

### Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# MinIO (local dev defaults — matches docker-compose.yml)
S3_ENDPOINT=http://localhost:9000
S3_ACCESS_KEY_ID=minioadmin
S3_SECRET_ACCESS_KEY=minioadmin123
S3_BUCKET_NAME=ctms-documents
S3_SIGNATURES_BUCKET_NAME=ctms-signatures
S3_REGION=us-east-1
NEXT_PUBLIC_S3_PUBLIC_URL=http://localhost:9000/ctms-documents

# Email (Sprint 11+)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=noreply@yourctms.com

# AI features (Sprint 23+)
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxx
```

### MinIO Object Storage

MinIO is an S3-compatible object storage server used locally for document uploads. In production, swap it for AWS S3, Cloudflare R2, or any S3-compatible service — only the env vars change, no code changes required.

```bash
# Start MinIO
docker compose up -d

# Stop MinIO
docker compose down

# View MinIO logs
docker compose logs -f minio

# Access MinIO web console
open http://localhost:9001
# Login: minioadmin / minioadmin123
```

**Buckets created automatically on first start:**
- `ctms-documents` — protocol PDFs, ICFs, monitoring reports, regulatory docs
- `ctms-signatures` — electronic signature artifacts

---

## Project Structure

```
src/
├── app/
│   ├── auth/                    # Sign in, sign up, callback
│   ├── dashboard/
│   │   ├── page.tsx             # Portfolio dashboard
│   │   ├── studies/             # Studies module
│   │   │   ├── page.tsx
│   │   │   ├── new/
│   │   │   └── [id]/
│   │   │       ├── page.tsx     # Study detail hub (tabbed)
│   │   │       ├── edit/
│   │   │       ├── sites/
│   │   │       ├── subjects/
│   │   │       ├── monitoring/
│   │   │       ├── deviations/
│   │   │       └── milestones/
│   │   └── monitoring/          # Monitor's visit queue
│   ├── admin/                   # User management
│   └── api/                     # API route handlers
│       ├── studies/
│       ├── sites/
│       ├── subjects/
│       ├── monitoring-visits/
│       ├── deviations/
│       ├── milestones/
│       └── documents/
├── components/
│   ├── ui/                      # shadcn primitives
│   ├── layout/                  # Sidebar, breadcrumbs, shell
│   ├── shared/                  # DataGrid, theme
│   ├── common/                  # RoleGuard, dialogs
│   └── ctms/                    # CTMS-specific components
│       ├── studies/
│       ├── sites/
│       ├── subjects/
│       ├── monitoring/
│       └── deviations/
├── hooks/                       # TanStack Query hooks
├── lib/                         # Supabase clients, utilities
├── types/                       # Database types, Zod schemas
└── constants/                   # Routes, roles, query keys
```

---

## Compliance Notes

This system is designed with GCP and 21 CFR Part 11 awareness:

- **Audit Trail**: All mutations on clinical data write to `audit_logs` (table, record ID, action, old/new data, user, timestamp)
- **Subject Pseudonymization**: No patient names or DOB stored — subject number + initials only
- **RLS Everywhere**: Every table has Row Level Security enabled; study access is gated by `study_team` membership
- **Role-Based Access**: Granular RBAC enforced at both API route and UI levels
- **Electronic Signatures**: Not implemented in MVP — deferred to Week 1 (see `planning/sprints.md`)

---

## Documentation

| File | Contents |
|---|---|
| `planning/ctms-blueprint.md` | Full functional + technical specification |
| `planning/sprints.md` | Day 1 build plan, sprint breakdown, AI prompts |
| `docs/database.md` | Schema reference, RLS policies, conventions |
| `docs/api-contracts.md` | API endpoint contracts (request/response shapes) |
| `planning/features.md` | Feature status tracker |

---

## Roadmap

All features are planned and will be delivered. See `planning/sprints.md` for full sprint details.

```mermaid
gantt
    title CTMS Full Delivery Roadmap
    dateFormat YYYY-MM-DD
    excludes weekends

    section Day 1 · Core CTMS
        Schema + Config             :done, s0, 2026-03-14, 1h
        Studies + Sites + Subjects  :s1, after s0, 5h
        Visits + Deviations + Miles :s2, after s1, 3h
        Dashboard + Polish          :s3, after s2, 1h30m

    section Day 2 · Compliance + Storage
        MinIO + Document Uploads    :s9,  2026-03-15, 2h
        Electronic Signatures       :s10, after s9, 2h
        Email Notifications         :s11, after s10, 1h
        Audit UI + Team Management  :s12, after s11, 1h30m

    section Week 1 · Operations
        Budget + Financials         :s13, 2026-03-16, 2d
        Site Performance Scorecards :s14, 2026-03-17, 1d
        Communication Center        :s15, 2026-03-18, 1d
        Portfolio + Study Startup   :s16, 2026-03-19, 1d

    section Week 2 · Integrations
        EDC Integration REDCap      :s17, 2026-03-23, 2d
        Supply Chain IMP Tracking   :s18, 2026-03-24, 2d
        Full 21 CFR Part 11 e-Sign  :s19, 2026-03-25, 1d
        Regulatory Compliance       :s20, 2026-03-26, 1d
        Custom Form Builder         :s21, 2026-03-27, 1d

    section Week 3 · AI + Mobile
        eTMF Integration            :s22, 2026-03-30, 2d
        Predictive Enrollment AI    :s23, 2026-04-01, 2d
        AI Site Selection           :s24, 2026-04-02, 1d
        Advanced Analytics          :s25, 2026-04-03, 1d
        Mobile PWA                  :s26, 2026-04-06, 2d
```
