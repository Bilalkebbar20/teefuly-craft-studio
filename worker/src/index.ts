/**
 * TEVULY Edge Worker — entry point.
 *
 * Topology (mirrors the locked Phase-A plan):
 *   middlewares: requestId -> context(config/logger) -> CORS(allowlist)
 *   routes:      /api/health, /api/products[/:slug]
 *   everything else under /api        => structured 404
 *   everything else with ASSETS bound => SPA fallback
 *   everything else unbounded         => plain 404
 *   errors                            => { error: { code, message, requestId } }
 *
 * Paid-tier seams (DO/Queues/R2) are NOT exercised in Phase A; they are
 * exposed on the WorkerEnv type and gated by optional bindings so the
 * architecture can grow without a rewrite.
 */

import { Hono } from "hono";
import type { ExportedHandler } from "@cloudflare/workers-types";
import type { ContentfulStatusCode } from "hono/utils/http-status";

import type { WorkerEnv } from "./env";
import { loadConfig } from "./env";
import { requestIdMiddleware } from "./infra/requestId";
import { corsMiddleware, buildAllowedOrigins } from "./infra/cors";
import { createLogger } from "./infra/logger";
import { ApiError, toErrorBody, methodNotAllowed } from "./infra/errors";
import { D1Client } from "./db/client";
import { ProductRepository } from "./db/repositories/productRepository";
import { CatalogService } from "./services/catalogService";
import { healthRoute } from "./routes/health";
import { productsRoutes } from "./routes/products";
import "./infra/context";

const app = new Hono<{ Bindings: WorkerEnv }>();

// 1. Request ID first so every downstream log/error can reference it.
app.use("*", requestIdMiddleware);

// 2. Context: validated config + redacted logger origin + catalog service.
app.use("*", async (c, next) => {
  const cfg = loadConfig(c.env);
  c.set("config", cfg);
  c.set("logger", createLogger(cfg.APP_ENV));
  c.set("catalog", new CatalogService(new ProductRepository(new D1Client(c.env.TEVULY_D1)), cfg.PUBLIC_BASE_URL));
  const extraOrigins = cfg.CORS_ORIGINS.split(",").map((s) => s.trim()).filter(Boolean);
  const origins = buildAllowedOrigins(cfg.PUBLIC_BASE_URL, extraOrigins, cfg.APP_ENV);
  await corsMiddleware(origins)(c, next);
});

// 3. Mounted API surface.
app.route("/api/health", healthRoute());
app.route("/api/products", productsRoutes());

// 4. Non-matching /api* paths => structured 404.
app.notFound(async (c) => {
  const url = new URL(c.req.url);
  if (url.pathname.startsWith("/api")) {
    if (c.req.method !== "GET") {
      throw methodNotAllowed(c.req.method, url.pathname);
    }
    return c.json({ error: { code: "NOT_FOUND", message: "API endpoint not found", requestId: c.get("requestId") } }, 404);
  }
  if (c.env.ASSETS) {
    // SPA routing: unknown client-side paths fall through to the asset
    // handler, which serves index.html for navigation requests.
    const res = await c.env.ASSETS.fetch(c.req.raw);
    return res;
  }
  return c.text("Not found", 404);
});

// 5. Central error envelope — internals never leak to clients.
app.onError(async (err, c) => {
  const requestId = c.get("requestId") ?? "unknown";
  const cfg = c.get("config");
  const production = cfg ? cfg.APP_ENV === "production" : true;
  const status = err instanceof ApiError ? err.status : 500;
  const code = err instanceof ApiError ? err.code : "INTERNAL_ERROR";
  c.get("logger")?.error("request failed", { requestId, status, code });
  return c.json(toErrorBody(err, requestId, production), status as ContentfulStatusCode);
});

export default {
  fetch: app.fetch,

  scheduled(_controller, _env, ctx) {
    // Free-tier async engine: the D1 `jobs` table is the queue, polled by
    // the pickup cron. Phase A seeds no jobs — the engine lands with the
    // fulfillment/email phases. This guard keeps the handler a no-op until
    // then, so a misconfigured cron can never fabricate work.
    ctx.waitUntil(Promise.resolve());
  },
} satisfies ExportedHandler<WorkerEnv>;