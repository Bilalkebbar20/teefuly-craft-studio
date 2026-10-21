/**
 * CORS enforcement.
 *
 * Strict origin allowlist only — never `*`. State-changing requests from
 * disallowed origins are rejected with 403. Preflights (OPTIONS) are
 * answered for allowed origins and rejected otherwise. `Vary: Origin` is
 * emitted so caches never serve one origin's headers to another.
 */

import type { MiddlewareHandler } from "hono";
import { forbidden } from "./errors";

export function buildAllowedOrigins(baseUrl: string, extra: string[], appEnv: string): string[] {
  const origins = new Set<string>([baseUrl, ...extra]);
  if (appEnv === "development") {
    // Local SPA dev servers (cross-origin direct API calls).
    origins.add("http://localhost:8080");
    origins.add("http://localhost:5173");
    origins.add("http://127.0.0.1:8080");
    origins.add("http://127.0.0.1:5173");
  }
  return [...origins].filter(Boolean);
}

export function corsMiddleware(allowedOrigins: string[]): MiddlewareHandler {
  const allowed = new Set(allowedOrigins);

  return async (c, next) => {
    const origin = c.req.header("origin");

    if (c.req.method === "OPTIONS") {
      if (!origin) return c.body(null, 204);
      if (!allowed.has(origin)) {
        return c.json({ error: { code: "CORS_ORIGIN_NOT_ALLOWED", message: "Origin not allowed" } }, 403);
      }
      return c.body(null, 204, {
        "access-control-allow-origin": origin,
        "access-control-allow-methods": "GET, POST, OPTIONS",
        "access-control-allow-headers": "content-type, x-csrf-token, x-request-id",
        "access-control-max-age": "86400",
      });
    }

    if (origin) {
      if (!allowed.has(origin)) {
        return c.json({ error: { code: "CORS_ORIGIN_NOT_ALLOWED", message: "Origin not allowed" } }, 403);
      }
      c.header("access-control-allow-origin", origin);
      c.header("vary", "Origin");
    }

    await next();
  };
}

export { forbidden };