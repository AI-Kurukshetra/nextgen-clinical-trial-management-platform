import { NextResponse } from "next/server";
import type { ApiErrorBody, ApiErrorPayload, ApiMetadata, ApiSuccess } from "@/types/api";

/**
 * Send a success JSON response with optional message and metadata (e.g. pagination).
 */
export function sendSuccess<T>(
  data: T,
  status = 200,
  options?: { message?: string; metadata?: ApiMetadata }
): NextResponse<ApiSuccess<T>> {
  const body: ApiSuccess<T> = {
    success: true,
    data,
    ...(options?.message && { message: options.message }),
    ...(options?.metadata && { metadata: options.metadata }),
  };
  return NextResponse.json(body, { status });
}

/**
 * Send an error JSON response. Use for API route handlers.
 */
export function sendError(
  error: string | Error | ApiErrorPayload,
  status = 400,
  details?: unknown
): NextResponse<ApiErrorBody> {
  const payload: ApiErrorPayload =
    typeof error === "string"
      ? { message: error }
      : error instanceof Error
        ? { message: error.message }
        : error;

  const body: ApiErrorBody = {
    success: false,
    error: payload,
    message: payload.message,
    ...(details !== undefined && { details }),
  };
  return NextResponse.json(body, { status });
}
