# Product

> AI-native SaaS starter. Replace with your actual product definition when building a real product.

---

## Problem

Teams need a production-ready starter with auth, RBAC, and a clear API/data layer so they can ship features quickly without re-inventing infrastructure.

---

## Target Users

- Developers and teams building SaaS apps on Next.js and Supabase.
- AI agents that need consistent patterns (API routes, TanStack Query, Zod, single source of truth in docs).

---

## Value Proposition

- Next.js 16 App Router + Supabase Auth + TanStack Query + Axios + shadcn/ui in one repo.
- RBAC (admin/user), API route layer with typed success/error responses, and documentation that matches the code.

---

## Core User Flows

1. Sign up / sign in (email/password, email verification).
2. View and manage items on the dashboard (CRUD; role-based visibility).
3. View and manage profile.
4. Admin: full access to all items.

---

## Out of Scope (v1)

- OAuth (Google, GitHub) — removed for simplicity.
- Forgot/reset password.
- Multi-tenant or org-scoped data.

---

## Success Metrics

| Metric              | Target   |
| ------------------- | -------- |
| Setup to first run  | &lt; 15 min |
| Docs match code     | Yes      |

---

## Notes

- Schemas live in `src/types/schemas/`. API contracts in `docs/api-contracts.md`. Keep both updated when adding routes or forms.
