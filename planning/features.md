# Features

> All planned features. Each gets a row here and a folder in `features/` when development starts.

---

## Feature Status Legend

| Status        | Meaning                                               |
| ------------- | ----------------------------------------------------- |
| `planned`     | In the backlog, not yet started                       |
| `specced`     | `spec.md` and `design.md` written, ready to implement |
| `in progress` | Currently being built                                 |
| `done`        | Shipped                                               |
| `paused`      | Started but deprioritized                             |

---

## Feature List

| Feature             | Status | Priority | Notes                                |
| ------------------- | ------ | -------- | ------------------------------------ |
| User authentication | `done` | P0       | Supabase Auth, email/password, verify |
| Dashboard shell     | `done` | P0       | Layout, sidebar, nav, role-based     |
| User profile        | `done` | P1       | View profile (email, display name)   |
| Items CRUD           | `done` | P0       | List, create, edit, delete; API routes |
| _Feature name_      | `planned` | P1    | _Description_                        |

---

## Adding a Feature

1. Add a row to the table above
2. Create `features/<feature-name>/` folder
3. Write `spec.md`, `design.md`, `tasks.md` using the template in `features/_template/`
4. Update status to `specced`
