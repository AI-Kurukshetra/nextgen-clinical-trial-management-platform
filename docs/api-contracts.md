# API Contracts

> This document is the source of truth for all API routes.
> Update it every time a route is added, changed, or removed.

---

## Conventions

- All routes are prefixed with `/api/`
- All requests and responses use JSON
- Authentication: Supabase session cookie (same-origin; axios client sends credentials)
- **Success format:** `{ success: true, data: T, message?: string, metadata?: { pagination?: {...} } }` — see `src/types/api.ts`
- **Error format:** `{ success: false, error: { code?: string, message: string }, message?: string, details?: unknown }`
- Client uses `apiGet`, `apiPost`, `apiPatch`, `apiDelete` from `src/lib/api/client.ts`; responses are unwrapped to `data` or throw `ApiRequestError`

---

## Items

### `GET /api/items`

Returns all items (ordered by `created_at` desc). RLS applies server-side.

**Response `200`**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "string",
      "description": "string | null",
      "created_at": "ISO8601",
      "updated_at": "ISO8601",
      "created_by": "uuid"
    }
  ]
}
```

**Errors**
| Status | Meaning |
|--------|---------|
| 401 | Not authenticated |
| 500 | Server error |

---

### `POST /api/items`

Create a new item.

**Request body**
```json
{
  "title": "string (required, min 1)",
  "description": "string (optional)"
}
```

**Response `201`**
```json
{
  "success": true,
  "data": { "id": "uuid", "title": "...", "description": "...", "created_at": "...", "updated_at": "...", "created_by": "uuid" },
  "message": "Item created."
}
```

**Errors**
| Status | Meaning |
|--------|---------|
| 400 | Validation failed (details may include Zod flatten) |
| 401 | Not authenticated |
| 500 | Server error |

---

### `GET /api/items/:id`

Get a single item by ID.

**Response `200`**
```json
{
  "success": true,
  "data": { "id": "uuid", "title": "...", "description": "...", "created_at": "...", "updated_at": "...", "created_by": "uuid" }
}
```

**Errors**
| Status | Meaning |
|--------|---------|
| 401 | Not authenticated |
| 404 | Item not found |
| 500 | Server error |

---

### `PATCH /api/items/:id`

Update an item. Caller must be owner or admin.

**Request body**
```json
{
  "title": "string (optional)",
  "description": "string (optional)"
}
```

**Response `200`**
```json
{
  "success": true,
  "data": { "...updated item..." },
  "message": "Item updated."
}
```

**Errors**
| Status | Meaning |
|--------|---------|
| 400 | Validation failed |
| 401 | Not authenticated |
| 403 | Forbidden (not owner or admin) |
| 404 | Item not found |
| 500 | Server error |

---

### `DELETE /api/items/:id`

Delete an item. Caller must be owner or admin.

**Response `200`**
```json
{
  "success": true,
  "data": null,
  "message": "Item deleted."
}
```

**Errors**
| Status | Meaning |
|--------|---------|
| 401 | Not authenticated |
| 403 | Forbidden |
| 404 | Item not found |
| 500 | Server error |

---

### `POST /api/items/seed`

Seed demo items for the current user. No body. If user already has items, returns 200 with message that no seed was needed.

**Response `200`** (already has items)
```json
{
  "success": true,
  "data": { "message": "You already have items. No seed needed." },
  "message": "You already have items. No seed needed."
}
```

**Response `201`** (items created)
```json
{
  "success": true,
  "data": { "message": "Demo items added." },
  "message": "Demo items added."
}
```

**Errors**
| Status | Meaning |
|--------|---------|
| 401 | Not authenticated |
| 500 | Server error |

---

## Profile

### `GET /api/profile/current`

Returns the current user and profile (id, full_name, avatar_url, role). Used by `useCurrentUser()` and `useRole()`.

**Response `200`**
```json
{
  "success": true,
  "data": {
    "user": { "id": "uuid", "email": "string | null" },
    "profile": { "id": "uuid", "full_name": "string | null", "avatar_url": "string | null", "role": "string" } | null
  }
}
```

**Errors**
| Status | Meaning |
|--------|---------|
| 401 | Not authenticated |
| 500 | Server error |

---

## Adding New Routes

When a new API route is implemented, add its contract here. Include:
- HTTP method + path
- Authentication requirement
- Request body (if any)
- Response shape (success and error)
- All possible error status codes
