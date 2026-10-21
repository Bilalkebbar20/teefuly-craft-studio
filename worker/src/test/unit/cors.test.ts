/**
 * CORS behavior — replayed in the fast node pool via Hono's app.request(),
 * so middleware short-circuit paths are guarded without booting workerd.
 * (The integration suite covers the same behavior through the real runtime.)
 */

import { describe, it, expect } from "vitest";
import { app } from "../../index";

const ENV = {
  // Minimal D1 facade (list route returns empty data; the cors unit test
  // asserts middleware behavior, not catalog content).
  TEVULY_D1: {
    prepare: () => ({
      bind: () => ({
        all: async () => ({ results: [] }),
        first: async () => null,
        run: async () => ({}),
      }),
    }),
  } as unknown as D1Database,
  APP_ENV: "development",
  PUBLIC_BASE_URL: "https://tevuly.com",
  CORS_ORIGINS: "https://tevuly.com",
} as const;

describe("cors middleware", () => {
  it("rejects requests from disallowed origins with a structured 403", async () => {
    const res = await app.request(
      "https://tevuly.com/api/products",
      { headers: { origin: "https://evil.example.com" } },
      ENV as never,
    );
    expect(res.status).toBe(403);
    const body = (await res.json()) as { error: { code: string; message: string } };
    expect(body.error.code).toBe("CORS_ORIGIN_NOT_ALLOWED");
  });

  it("answers preflight for allowed origins with 204 + allow-origin", async () => {
    const res = await app.request(
      "https://tevuly.com/api/products",
      {
        method: "OPTIONS",
        headers: { origin: "https://tevuly.com", "access-control-request-method": "GET" },
      },
      ENV as never,
    );
    expect(res.status).toBe(204);
    expect(res.headers.get("access-control-allow-origin")).toBe("https://tevuly.com");
  });

  it("preflight from disallowed origin is 403", async () => {
    const res = await app.request(
      "https://tevuly.com/api/products",
      {
        method: "OPTIONS",
        headers: { origin: "https://evil.example.com", "access-control-request-method": "GET" },
      },
      ENV as never,
    );
    expect(res.status).toBe(403);
  });

  it("allowed origins get an origin-echoed response", async () => {
    const res = await app.request(
      "https://tevuly.com/api/products",
      { headers: { origin: "https://tevuly.com" } },
      ENV as never,
    );
    expect(res.headers.get("access-control-allow-origin")).toBe("https://tevuly.com");
    expect(res.headers.get("vary")).toContain("Origin");
  });
});