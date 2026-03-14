import type { AuditLog } from "@/types/database";

/**
 * Standard API response types. All success responses use ApiSuccess<T>;
 * all error responses use ApiErrorPayload (in JSON body) and appropriate HTTP status.
 */

export interface ApiPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiMetadata {
  pagination?: ApiPagination;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
  message?: string;
  metadata?: ApiMetadata;
}

export interface ApiErrorPayload {
  code?: string;
  message: string;
}

/** Zod validation details when present (e.g. from safeParse). */
export interface ApiErrorDetails {
  details?: unknown;
}

export interface ApiErrorBody extends ApiErrorDetails {
  success: false;
  error: ApiErrorPayload;
  message?: string;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiErrorBody;

/** Response with paginated list. */
export interface PaginatedResponse<T> extends ApiSuccess<T[]> {
  metadata: ApiMetadata & { pagination: ApiPagination };
}

/** GET /api/profile/current response data shape. */
export interface CurrentUserProfile {
  user: { id: string; email: string | null } | null;
  profile: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    role: string;
  } | null;
}

/** User item in admin Users list (backed by profiles). */
export interface UserListItem {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  role: string;
  created_at: string;
}

export interface AuditActivity extends AuditLog {
  actor_name: string;
  actor_email: string | null;
  entity_label: string;
  entity_name: string | null;
  message: string;
}
