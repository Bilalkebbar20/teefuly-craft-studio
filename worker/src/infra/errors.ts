/**
 * Normalized API errors.
 *
 * Every error reaches the client as:
 *   { "error": { "code", "message", "requestId", "details?" } }
 * Stack traces and internal details are NEVER serialized to clients
 * (omitted entirely when APP_ENV === "production").
 */

import type { ApiErrorBody } from "../types/canonical";

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: unknown;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function badRequest(code: string, message: string, details?: unknown): ApiError {
  return new ApiError(400, code, message, details);
}

export function notFound(code: string, message: string): ApiError {
  return new ApiError(404, code, message);
}

export function methodNotAllowed(method: string, path: string): ApiError {
  return new ApiError(405, "METHOD_NOT_ALLOWED", `Method ${method} not allowed for ${path}`, {
    allowed: ["GET"],
  });
}

export function tooManyRequests(): ApiError {
  return new ApiError(429, "RATE_LIMITED", "Too many requests. Please retry shortly.");
}

export function forbidden(code: string, message: string): ApiError {
  return new ApiError(403, code, message);
}

export function internalError(message = "Internal error"): ApiError {
  return new ApiError(500, "INTERNAL_ERROR", message);
}

function isJsonSerializable(value: unknown): boolean {
  try {
    return !(value instanceof Error);
  } catch {
    return false;
  }
}

export function toErrorBody(err: unknown, requestId: string | undefined, production: boolean): ApiErrorBody {
  if (err instanceof ApiError) {
    return {
      error: {
        code: err.code,
        message: err.message,
        requestId,
        ...(err.details !== undefined && isJsonSerializable(err.details) ? { details: err.details } : {}),
      },
    };
  }
  // Unknown/unexpected — generic envelope, no internals leaked.
  return {
    error: {
      code: "INTERNAL_ERROR",
      message: production ? "Internal server error" : String(err),
      requestId,
    },
  };
}