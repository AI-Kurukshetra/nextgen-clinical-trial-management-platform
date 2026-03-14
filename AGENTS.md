# AGENTS.md

> Entry point for all AI agents and coding assistants working in this repository.
> Read this file first. Keep it open. Follow it for every task.

---

## 0. Project State Snapshot (read first)

- Mandatory startup checklist for every new agent:
  1. Read `completed.md` fully before proposing work.
  2. Treat `completed.md` as the live execution log for completed sprints/tasks.
  3. Continue from the next unfinished sprint in `planning/sprints.md` unless the user redirects scope.
- Current sprint status:
  - Sprint 0: completed
  - Sprint 1: completed (Protocol/Design entities, APIs, hooks, tabs)
  - Sprint 2: completed (Sites Module)
  - Sprint 3: completed (Subject Enrollment)
  - Sprint 4: completed (Monitoring Visits)
  - Sprint 5: completed (Deviations)
  - Sprint 6: completed (Milestones)
  - Sprint 7: completed (Portfolio Dashboard)
  - Sprint 8: completed (Navigation & Polish)
  - Sprint 9: completed (Document Upload with MinIO/S3 metadata workflows)
  - Next target: Sprint 10
- Database migration status:
  - Applied migration includes protocol entities and `studies.safety_rules/statistical_plan`:
    `supabase/migrations/20260314000006_protocol_entities.sql`
  - Applied migration includes site-level permissions + subject assignments:
    `supabase/migrations/20260314000007_site_permissions_and_assignments.sql`
- DB change execution rule:
  - For any new DB/table/column/policy change, prefer applying via **Supabase MCP tools** first.
  - If MCP is unavailable for a required DB action, ask user approval and run CLI fallback (`npx supabase db push`).
  - After DB change, verify API endpoints that depend on the new schema.
- Sprint completion seeding rule:
  - After completing each sprint, insert minimal dummy data for the new entities (idempotent inserts) so UI screens are demonstrable immediately.
- Access baseline:
  - Ensure `ketan.rathod@bacancy.com` remains `admin` in `public.profiles` during local/dev testing.

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
  components/   # ui/, shared/, dashboard/, common layout pieces
  hooks/        # TanStack Query hooks (one file per resource)
  lib/          # api client, supabase, auth, utils
  constants/    # routes, query-keys, roles
  types/        # database, api, schemas/ (Zod)
docs/           # database.md, api-contracts.md (living references)
planning/       # product context, feature backlog
AGENTS.md       # this file
COMMANDS.md     # reusable agent commands
```

---

## 3. Core Rules (non‑negotiable)

1. **Plan first, then code.** Always propose an implementation plan and get explicit user consent before making changes (except truly trivial edits).
2. **Ask before CLI.** Before running any CLI command that installs packages, runs migrations, changes config, or modifies the DB, ask the user and show the exact command.
3. **Rendering:** Prefer client-side rendering for authenticated/dashboard pages.
4. **Server state:** Use TanStack Query hooks only, backed by `apiGet` / `apiPost` / etc. from `@/lib/api/client`. No raw `fetch` in components or hooks.
5. **Forms:** Every form uses React Hook Form + a Zod schema from `src/types/schemas/`, shared between client and server.
6. **UI:** Use shadcn components from `components/ui/` only. Do not install other UI libraries.
7. **Supabase:** Use clients from `lib/supabase/` (browser/server) only. Never initialize Supabase inline.
8. **Validation:** Validate all inputs on API routes with Zod schemas (same schema as the form).
9. **Types:** Keep types in `src/types/` and align them with Supabase types where possible.
10. **Docs:** When you add or change API routes or tables, update `docs/api-contracts.md` and `docs/database.md`.

---

## 4. Architecture (how things fit together)

- **Rendering**
  - Authenticated/dashboard pages: client-side, data via TanStack Query.
  - Public/marketing pages: server-side or static as appropriate.
  - API: Next.js Route Handlers under `app/api/` (no separate backend).
- **Data flow**
  - Component → Hook in `hooks/` → Axios client in `lib/api/client` → Route handler in `app/api/` → Supabase server client in `lib/supabase/server` → Postgres.
  - All client-to-API calls go through the shared axios instance; never create a new axios client.
- **State**
  - Server state: TanStack Query.
  - Form state: React Hook Form.
  - Global UI state: React Context (sparingly).
  - Local component state: `useState` / `useReducer`.
- **Validation**
  - Zod schemas in `src/types/schemas/` are the single source of truth, reused on client and server.

---

## 5. Auth & RBAC (what to use)

- **Roles & storage**
  - Roles: `admin`, `study_manager`, `monitor`, `site_coordinator`, `viewer` stored on `profiles.role` (see `src/constants/roles.ts` and `docs/database.md`).
- **Route protection**
  | Path pattern | Allowed roles |
  | -------------- | --------------- |
  | `/dashboard/*` | all authenticated roles |
  | `/admin/*` | admin |
  | `/profile/*` | all authenticated roles |
- **Server helpers** (from `@/lib/auth`)
  - `requireAuth()` → ensures a session; returns `{ user, profile }` or `null`.
  - `requireRole(allowedRoles)` → ensures role membership; returns same shape or `null`.
- **Frontend**
  - `useCurrentUser()` and `useRole()` hooks for user + role.
  - `RoleGuard` component and role-aware nav for conditional UI.

---

## 6. API Route Pattern (example)

Location: `app/api/<resource>/route.ts`. Use `requireAuth`, Supabase server client, and `sendSuccess` / `sendError`.

```ts
import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { createServerClient } from "@/lib/supabase/server";
import { sendSuccess, sendError } from "@/lib/utils/api";
import { myCreateSchema } from "@/types/schemas";

export async function GET() {
  const auth = await requireAuth();
  if (!auth) return sendError("Unauthorized", 401);

  const supabase = await createServerClient();
  const { data, error } = await supabase.from("items").select("*");
  if (error) return sendError(error.message, 500);
  return sendSuccess(data ?? []);
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth();
  if (!auth) return sendError("Unauthorized", 401);

  const parsed = myCreateSchema.safeParse(await req.json());
  if (!parsed.success) return sendError("Validation failed", 400, parsed.error.flatten());

  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("items")
    .insert({ ...parsed.data, created_by: auth.user.id })
    .select()
    .single();
  if (error) return sendError(error.message, 500);
  return sendSuccess(data, 201, { message: "Item created." });
}
```

---

## 7. Hooks & State (example)

- One file per resource in `hooks/` exporting queries and mutations.
- Query keys are stable objects, e.g. `itemKeys.all`, `itemKeys.detail(id)`.

```ts
// hooks/use-items.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api/client";
import type { Item, ItemCreateInput, ItemUpdateInput } from "@/types";

export const itemKeys = {
  all: ["items"] as const,
  detail: (id: string) => [...itemKeys.all, "detail", id] as const,
};

export function useItems() {
  return useQuery({
    queryKey: itemKeys.all,
    queryFn: () => apiGet<Item[]>("/items"),
  });
}

export function useCreateItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ItemCreateInput) => apiPost<Item>("/items", input),
    onSuccess: () => qc.invalidateQueries({ queryKey: itemKeys.all }),
  });
}
```

---

## 8. Forms (example)

Pattern: Zod schema → React Hook Form → shadcn `Form` → mutation hook.

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { itemCreateSchema, type ItemCreateInput } from "@/types/schemas";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCreateItem } from "@/hooks/use-items";

export function CreateItemForm() {
  const form = useForm<ItemCreateInput>({ resolver: zodResolver(itemCreateSchema) });
  const { mutate, isPending } = useCreateItem();

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => mutate(data))}>
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isPending}>
          {isPending ? "Creating..." : "Create"}
        </Button>
      </form>
    </Form>
  );
}
```

---

## 9. Frontend & UI

- **Routing**
  - `app/auth/` → unauthenticated pages (sign-in, sign-up, callback).
  - `app/dashboard/` → authenticated pages (all roles).
  - `app/admin/` → admin-only pages.
  - `app/profile/` → authenticated profile.
  - `app/api/` → API route handlers.
- **Components**
  - `components/ui/` → shadcn primitives (never edit; only add via CLI).
  - `components/shared/` → reusable app-level components (e.g. page header, data table).
  - `components/dashboard/` → dashboard-specific components.
  - Use named exports (except Next.js `page.tsx` defaults) and keep business logic in hooks.
- **Styling**
  - Tailwind utilities only; use `cn()` for conditional classes.
  - Use semantic tokens like `text-muted-foreground`, not raw `text-gray-500`.
  - No CSS modules; no inline `style` except for truly dynamic values.
- **Layout & responsiveness**
  - Use consistent spacing (`mt-6`, `p-6`, `space-y-4`, `gap-4`).
  - Mobile-first layouts with Tailwind breakpoints (e.g. `md:`, `lg:`).

---

## 10. Coding Standards (summary)

- **TypeScript**
  - Strict mode; no `any`; avoid `as unknown as X`.
  - Prefer `interface` for objects, `type` for unions; use `satisfies` over `as`.
- **Naming**
  - Files: kebab-case (`use-items.ts`).
  - Components: PascalCase (`ItemsTable`).
  - Hooks: `use` + camelCase (`useItems`).
  - Constants: SCREAMING_SNAKE_CASE.
  - Zod schemas: camelCase + `Schema` suffix (`itemCreateSchema`).
- **Imports**
  - Use `@/` path aliases; avoid deep `../../` imports.
  - Import order: React → Next → third-party → `@/` → relative → types.
- **Errors & commits**
  - Never swallow errors; log with context and surface to the user (toast or error state).
  - Use Conventional Commits (`feat: ...`, `fix: ...`, `docs: ...`, etc.).

---

## 11. Do's and Don'ts (critical guardrails)

**DO**

- Always present a clear plan and get user consent before implementing changes.
- Ask for explicit confirmation (and show commands) before running any CLI that installs packages, runs migrations, or changes config/DB.
- Use `requireAuth()` / `requireRole()` for all protected routes.
- Validate all API inputs with Zod schemas (shared with the client).
- Use `sendSuccess()` / `sendError()` for all API responses.
- Use TanStack Query hooks for all data fetching via `@/lib/api/client` helpers.
- Use shadcn components from `components/ui/` and wrap them in `components/shared/` when you need customization.
- Use Tailwind semantic tokens and `cn()` for styling.
- Handle loading, error, and empty states in every data-driven component.
- Use `@/` path aliases for imports.
- Update `docs/api-contracts.md` when API routes change.
- Update `docs/database.md` when database tables or columns change.

**DON'T**

- Do **not** start implementing without first getting user approval on a plan.
- Do **not** run destructive or state-changing CLI commands without asking (e.g., `npm install`, migrations, DB commands, config changes).
- Do **not** create shadcn components manually; always use `npx shadcn@latest add <name>`.
- Do **not** edit files in `components/ui/` (they are generated primitives).
- Do **not** install new npm packages unless the user explicitly instructs you to.
- Do **not** use raw `fetch()` or create new axios instances; always use the shared client helpers.
- Do **not** use `console.log` in production code; use `console.error` only for real errors.
- Do **not** hardcode user IDs, secrets, environment values, or service-role keys.
- Do **not** write raw SQL in components or hooks; keep SQL to migrations or server-side Supabase calls.
- Do **not** skip Zod validation on API routes or bypass RLS with the service-role key for user-facing traffic.
- Do **not** use `any`, inline styles, or CSS modules.
- Do **not** swallow errors in empty `catch {}` blocks.
- Do **not** use relative imports beyond one level (`../../`).
- Do **not** prop-drill beyond 2 levels; prefer hooks or context instead.

---

## 12. Workflow & References

- **Default workflow:** PLAN (propose and confirm a plan) → IMPLEMENT (follow the plan) → VERIFY (re-check requirements and side effects).
- When the user provides feature requirements, still follow this loop but use only the MD files and context they give you.
- **Mandatory API verification:** Next.js runtime is expected at `http://localhost:3000`. For every sprint, test all created/updated API routes for unauthenticated behavior, authenticated success, validation failure, and DB/RLS side effects before handoff.

**Reference files**

| File                    | Purpose                               |
| ----------------------- | ------------------------------------- |
| `COMMANDS.md`           | Reusable agent commands and workflows |
| `docs/api-contracts.md` | Source of truth for API routes        |
| `docs/database.md`      | Source of truth for DB schema and RLS |
| `planning/product.md`   | Product context and goals             |
| `planning/features.md`  | Feature backlog and statuses          |

**MCP tools**

| Tool       | Use For                                                        |
| ---------- | -------------------------------------------------------------- |
| `supabase` | Create/modify tables, run migrations, inspect schema           |
| `shadcn`   | Browse component registry, get implementations, add components |
| `context7` | Retrieve up-to-date library docs (version-specific)            |
| `git`      | Stage and commit changes                                       |
| `github`   | Open PRs, create issues                                        |
| `browser`  | Test UI, verify changes visually                               |
