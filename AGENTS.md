# AGENTS.md

> Entry point for all AI agents and coding assistants working in this repository.
> Read this file first. Keep it open. Follow it for every task.

---

## 0. Project State Snapshot (read first)

### Current Status: **Feature-complete v1 — paused for future sprints**

All 9 core sprints completed. The app is a production-grade CTMS with:
- Full studies/sites/subjects/milestones/documents CRUD
- 5-role RBAC (admin, study_manager, monitor, site_coordinator, viewer)
- Clean RLS (single consolidated migration)
- Realistic seed data (19 studies, 93 sites, 1224 subjects)
- All 35 API routes verified passing

### What was removed
- Monitoring Visits module (API, UI, hooks, nav) — out of scope for v1
- Deviations module (API, UI, hooks, nav) — out of scope for v1
- DB tables for both remain in Postgres for audit purposes (RLS blocks app access)

### Applied migrations (in order)
```
supabase/migrations/
  20260314000001_initial_ctms_schema.sql
  20260314000002_rls_policies.sql
  20260314000003_study_team_and_site_members.sql
  20260314000004_subjects_and_deviations.sql
  20260314000005_documents_and_signatures.sql
  20260314000006_protocol_entities.sql
  20260314000007_site_permissions_and_assignments.sql
  20260315000001_audit_logs.sql
  20260315000002_monitoring_visits.sql
  20260315000003_rls_patch_monitoring.sql
  20260315000004_rls_patch_deviations.sql
  20260315000005_rls_patch_subjects.sql
  20260315000006_fix_study_insert_policy.sql
  20260316000001_add_rls_document_signature.sql
  20260316000002_update_create_study_rpc_drop_protocol_fields.sql
  20260317000001_clean_rls_overhaul.sql        <- clean consolidated RLS
  20260317000002_form_improvement_columns.sql  <- new site/subject/study columns
```

### Test credentials
All seeded users share password: **`Ctms@2026!`**

Key accounts:
- `dr.sarah.chen@pharmaone.com` — study_manager
- `ketan.rathod@bacancy.com` — admin
- See `scripts/seed.mjs` for full user list

---

## 1. Stack

| Layer         | Technology                           |
| ------------- | ------------------------------------ |
| Framework     | Next.js 16 (App Router)              |
| Language      | TypeScript (strict mode)             |
| Database      | Supabase (Postgres + Auth + Storage) |
| UI Components | shadcn/ui                            |
| Server State  | TanStack Query v5                    |
| HTTP Client   | Axios (centralized in `lib/api/`)    |
| Forms         | React Hook Form + Zod                |
| Styling       | Tailwind CSS                         |
| Deployment    | Vercel                               |

---

## 2. Folder Structure (high level)

```text
src/
  app/          # App Router (auth, dashboard, admin, profile, api)
  components/   # ui/, shared/, ctms/, layout/
  hooks/        # TanStack Query hooks (one file per resource)
  lib/          # supabase clients, auth, audit, site-permissions, identifiers
  constants/    # routes, query-keys, roles, permissions
  types/        # database.ts, api.ts, schemas/ (Zod)
docs/           # database.md, api-contracts.md (living references)
planning/       # ctms-blueprint.md, sprints.md
scripts/        # seed.mjs, fix-milestones.mjs, test-routes.mjs
supabase/       # migrations/
AGENTS.md       # this file
COMMANDS.md     # reusable agent commands
```

---

## 3. Core Rules (non-negotiable)

1. **Plan first, then code.** Propose a plan and get user consent before making changes.
2. **Ask before CLI.** Show exact commands before running migrations, installs, or DB changes.
3. **Rendering:** Client-side rendering for authenticated/dashboard pages.
4. **Server state:** TanStack Query hooks only, backed by `apiGet`/`apiPost` etc. from `@/lib/api/client`.
5. **Forms:** React Hook Form + Zod schema from `src/types/schemas/`, shared between client and server.
6. **UI:** shadcn components from `components/ui/` only. No new UI libraries.
7. **Supabase:** Clients from `lib/supabase/` only. Never initialize Supabase inline.
8. **Validation:** Zod on every API route (same schema as the form).
9. **Docs:** Update `docs/api-contracts.md` and `docs/database.md` when routes or tables change.

---

## 4. Architecture

- **Data flow:** Component → Hook (`hooks/`) → Axios (`lib/api/client`) → Route handler (`app/api/`) → Supabase server client (`lib/supabase/server`) → Postgres
- **Auth:** Supabase SSR cookies (`sb-{project-ref}-auth-token`). API routes use `requireAuth()`.
- **RLS:** All tables have RLS. Helper functions defined in `20260317000001_clean_rls_overhaul.sql`.
- **Audit:** Every mutation calls `insertAuditLog()` from `src/lib/audit.ts`.
- **Site permissions:** `src/lib/site-permissions.ts` — `isGlobalStudyOperator(role)` returns true for `admin` and `study_manager`.

---

## 5. Auth & RBAC

Roles: `admin` | `study_manager` | `monitor` | `site_coordinator` | `viewer`

| Role             | Access level |
|------------------|--------------|
| admin            | Full system access |
| study_manager    | Create/manage studies, sites, subjects, milestones, documents |
| monitor          | View studies and reports |
| site_coordinator | Manage subjects at assigned sites |
| viewer           | Read-only on accessible studies |

**Server helpers** (`@/lib/auth`):
- `requireAuth()` → session check; returns `{ user, profile }` or `null`
- `requireRole(allowedRoles)` → role membership check

---

## 6. API Route Pattern

```ts
import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { sendSuccess, sendError } from "@/lib/utils/api";
import { myCreateSchema } from "@/types/schemas";

export async function GET() {
  const auth = await requireAuth();
  if (!auth) return sendError("Unauthorized", 401);
  const supabase = await createClient();
  const { data, error } = await supabase.from("items").select("*");
  if (error) return sendError(error.message, 500);
  return sendSuccess(data ?? []);
}
```

---

## 7. Critical: Zod Schema + `.partial()` Pattern

**Never call `.partial()` on a schema produced by `.refine()` (ZodEffects).**

```ts
// CORRECT
const baseSchema = z.object({ ... });
export const createSchema = baseSchema.refine(...);  // for create validation
export const updateSchema = baseSchema.partial();    // .partial() works on ZodObject

// WRONG — causes runtime TypeError: .partial() cannot be used on ZodEffects
const createSchema = z.object({ ... }).refine(...);
const updateSchema = createSchema.partial(); // ❌
```

---

## 8. Do's and Don'ts

**DO**
- Use `requireAuth()` for all protected routes
- Validate API inputs with Zod (shared schema with form)
- Use `sendSuccess()` / `sendError()` for all responses
- Handle loading, error, and empty states in every data-driven component

**DON'T**
- Call `.partial()` on a refined Zod schema (ZodEffects)
- Run destructive CLI without asking
- Edit files in `components/ui/` (shadcn primitives)
- Use raw `fetch()` or create new axios instances
- Hardcode service-role keys in source files
- Bypass RLS with service-role for user-facing traffic

---

## 9. Reference Files

| File                         | Purpose                                      |
| ---------------------------- | -------------------------------------------- |
| `COMMANDS.md`                | Reusable agent commands                      |
| `docs/api-contracts.md`      | Source of truth for API routes               |
| `docs/database.md`           | Source of truth for DB schema and RLS        |
| `planning/ctms-blueprint.md` | Full functional + technical spec             |
| `planning/sprints.md`        | Sprint history and backlog                   |
| `scripts/test-routes.mjs`    | Full API test suite (35 tests, all passing)  |
| `scripts/seed.mjs`           | DB seeder (users, studies, sites, subjects)  |
