import { NextResponse } from "next/server";

/**
 * Standard API response types for consistent response shape.
 */
export type ApiSuccess<T> = {
  ok: true;
  data: T;
};

export type ApiError = {
  ok: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

/**
 * Create a successful API response.
 */
export function ok<T>(data: T, status = 200): NextResponse<ApiSuccess<T>> {
  return NextResponse.json({ ok: true, data }, { status });
}

/**
 * Create an error API response.
 */
export function error(
  code: string,
  message: string,
  status = 400,
  details?: unknown,
): NextResponse<ApiError> {
  return NextResponse.json(
    {
      ok: false,
      error: { code, message, ...(details !== undefined && { details }) },
    },
    { status },
  );
}

/**
 * Common error responses
 */
export const errors = {
  unauthorized: () => error("UNAUTHORIZED", "Authentication required", 401),
  forbidden: () => error("FORBIDDEN", "Access denied", 403),
  notFound: (resource = "Resource") =>
    error("NOT_FOUND", `${resource} not found`, 404),
  badRequest: (message: string, details?: unknown) =>
    error("BAD_REQUEST", message, 400, details),
  internal: (message = "Internal server error") =>
    error("INTERNAL_ERROR", message, 500),
  validation: (details: unknown) =>
    error("VALIDATION_ERROR", "Invalid request data", 400, details),
};
