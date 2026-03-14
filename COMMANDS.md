# COMMANDS.md

> Reusable agent commands. Use these names in your prompts to trigger structured workflows.

---

## Usage with Codex CLI

Run commands by describing which command to invoke and what resource or task it should target.

```bash
codex "Run add-resource for resource: projects"
codex "Run add-api-route for resource: notifications"
codex "Run add-form: create project form on dashboard/projects page"
codex "Run fix-bug: items list shows 404 after delete"
codex "Run sync-docs"
```

You can also combine context, for example:

```bash
codex "In this repo, run add-resource for resource: tasks (CRUD, dashboard page, admin/user access)"
```

---

## `add-resource`

Implement a new domain resource end-to-end (DB + API + hooks + page).

**Steps:**
1. Design the resource shape (fields, ownership, roles) based on the user’s description.
2. Add or update the DB table and RLS policies via migration in `lib/supabase/migrations/` and Supabase MCP, then update `docs/database.md`.
3. Add Zod schemas and types in `src/types/schemas/<resource>.ts`.
4. Create API routes under `app/api/<resource>/` (list/create) and `app/api/<resource>/[id]/` (get/update/delete), validating with Zod, using `requireAuth` / `requireRole`, `createServerClient`, and `sendSuccess` / `sendError`, then update `docs/api-contracts.md`.
5. Create or update hooks in `hooks/use-<resource>.ts` using TanStack Query and `@/lib/api/client` helpers.
6. Add or extend dashboard UI (page + components) under `app/dashboard/<resource>/` and `components/`, wired to the hooks and respecting RBAC rules from `AGENTS.md`.

---

## `add-api-route`

Add or extend a Next.js API route for an existing resource.

**Steps:**
1. Create or update `app/api/<resource>/route.ts` or `app/api/<resource>/[id]/route.ts` for the needed methods.
2. Validate request bodies with the appropriate Zod schema from `src/types/schemas/`.
3. Authenticate with `requireAuth()` (and `requireRole()` when needed) from `@/lib/auth`.
4. Perform DB operations via the Supabase server client from `lib/supabase/server`.
5. Return responses with `sendSuccess()` / `sendError()` from `lib/utils/api`.
6. Document any new/changed endpoints in `docs/api-contracts.md`.

---

## `add-query-hook`

Add or extend TanStack Query hooks for a resource.

**Steps:**
1. Create or update `hooks/use-<resource>.ts` with a query key map and exported hooks.
2. Use `apiGet` / `apiPost` / `apiPatch` / `apiDelete` from `@/lib/api/client` for all HTTP calls (no raw `fetch` or new axios instances).
3. Implement `useQuery` hooks for reads (lists and/or detail) using stable query keys.
4. Implement `useMutation` hooks with `onSuccess` cache invalidation (and optimistic updates where UX needs it).
5. Export typed return values based on your domain types.

---

## `add-form`

Add a new form to an existing page or dialog using React Hook Form + Zod + shadcn.

**Steps:**
1. Create or update a Zod schema and inferred types in `src/types/schemas/<name>.ts`.
2. Build a React Hook Form-based component using shadcn `Form`, `FormField`, `FormItem`, `FormLabel`, `FormControl`, and `FormMessage`.
3. Wire submit to an appropriate TanStack Query mutation hook.
4. Handle loading, error, and success states (e.g. disable submit, show toasts, reset on success).
5. Ensure the corresponding API route validates with the same Zod schema.

---

## `add-db-table`

Add or change a Supabase table and its policies.

**Steps:**
1. Write a migration in `lib/supabase/migrations/<timestamp>_<name>.sql` defining columns, constraints, and indexes.
2. Add Row Level Security (RLS) policies for the new/changed table.
3. Run the migration via the Supabase MCP tools.
4. Regenerate DB types if needed and align `src/types/database.ts`.
5. Update `docs/database.md` with the new/changed table and its key columns/policies.

---

## `add-page`

Add a new dashboard page with layout and navigation.

**Steps:**
1. Create `app/dashboard/<page-name>/page.tsx` using the dashboard shell and shared layout components (see `AGENTS.md` section 9).
2. Compose the page from existing or new components under `components/shared/` and/or feature-specific locations.
3. Add the page to the sidebar or navigation config, respecting RBAC rules described in `AGENTS.md` (only show to allowed roles).
4. Wire the page to the relevant hooks and forms so it is fully functional.

---

## `fix-bug`

Diagnose and fix a reported bug without breaking adjacent behavior.

**Steps:**
1. Reproduce the bug and capture the exact input, path, and error.
2. Identify the root cause layer (API route, hook, component, schema, database, or config).
3. Implement a minimal fix aligned with existing patterns (validation, error handling, RBAC).
4. Re-test the original scenario and nearby flows to ensure no regressions.
5. Update docs if behavior or contracts changed, and prepare a `fix:` commit message.

---

## `sync-docs`

Bring `docs/api-contracts.md` and `docs/database.md` in sync with the current code and schema.

**Steps:**
1. Scan `app/api/` for actual routes and compare them to `docs/api-contracts.md`; add or adjust entries as needed.
2. Scan recent migrations in `lib/supabase/migrations/` and the live schema to confirm `docs/database.md` matches tables and key columns.
3. Apply doc updates so both files accurately describe the current API and DB.
4. Summarize changes for a `docs: sync documentation` commit.

