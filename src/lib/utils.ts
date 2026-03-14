import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { ApiRequestError } from "@/lib/api/client"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Derive a user-facing message from an unknown error.
 * Handles Error, ApiRequestError, API error body shape, and strings.
 */
export function getErrorMessage(
  error: unknown,
  fallback = "Something went wrong."
): string {
  if (error instanceof ApiRequestError) return error.message
  if (error instanceof Error) return error.message
  if (typeof error === "string") return error
  if (
    error &&
    typeof error === "object" &&
    "error" in error &&
    typeof (error as { error?: { message?: string } }).error?.message === "string"
  ) {
    return (error as { error: { message: string } }).error.message
  }
  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof (error as { message: unknown }).message === "string"
  ) {
    return (error as { message: string }).message
  }
  return fallback
}
