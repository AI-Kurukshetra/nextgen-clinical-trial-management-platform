# Database

## Stack

- **Postgres** hosted on Supabase
- **Migrations** managed via versioned SQL files in `supabase/migrations/`
- **Row Level Security (RLS)** enabled on every table
- **TypeScript types** in `src/types/database.ts` (manual; can be regenerated from Supabase CLI if desired)

---

## Migration Conventions

### File Naming

```
supabase/migrations/
  20250308000001_init_schema.sql
```

Format: `YYYYMMDDHHMMSS_<description>.sql`

### Table Conventions

| Column       | Type         | Notes                    |
| ------------ | ------------ | ------------------------ |
| `id`         | `uuid`       | Default `gen_random_uuid()` where applicable |
| `created_by` | `uuid`       | FK to `auth.users(id)` for user-owned content |
| `created_at` | `timestamptz` | Default `now()`        |
| `updated_at` | `timestamptz` | Managed by trigger     |

- All tables live in the `public` schema.
- Enum-like columns use `text` with a `check` constraint.

---

## Current Schema

### `profiles`

Stores app-level user data including role for RBAC. Row is created on sign-up via `handle_new_user` trigger.

| Column      | Type         | Notes                          |
| ----------- | ------------ | ------------------------------ |
| id          | uuid         | PK, FK to auth.users(id)       |
| email       | text         |                                |
| full_name   | text         |                                |
| avatar_url  | text         |                                |
| role        | text         | admin / user; default 'user'   |
| created_at  | timestamptz  |                                |
| updated_at  | timestamptz  |                                |

### `items`

Demo entity for dashboard content. Users can CRUD own items; admins can CRUD any.

| Column      | Type         | Notes                    |
| ----------- | ------------ | ------------------------ |
| id          | uuid         | PK                       |
| title       | text         | not null                 |
| description | text         |                          |
| created_by  | uuid         | FK auth.users            |
| created_at  | timestamptz  |                          |
| updated_at  | timestamptz  |                          |

---

## Row Level Security

- **profiles:** Authenticated users can select all (for display); insert/update only own row.
- **items:** Authenticated users can select all; insert with `created_by = auth.uid()`; update/delete own or (for admins) any. See migration file for full policies.

---

## Useful Queries

```sql
-- All tables with RLS status
select tablename, rowsecurity
from pg_tables
where schemaname = 'public';

-- All policies
select tablename, policyname, cmd, qual
from pg_policies
where schemaname = 'public';
```
