/**
 * GET /api/health — liveness + DB reachability probe.
 */

import { Hono } from "hono";
import type { WorkerEnv } from "../env";

export function healthRoute(): Hono<{ Bindings: WorkerEnv }> {
  const api = new Hono<{ Bindings: WorkerEnv }>();

  api.get("/", async (c) => {
    let db: "ok" | "error" = "ok";
    try {
      await c.env.TEVULY_D1.prepare("SELECT 1 AS ok").first();
    } catch {
      db = "error";
    }
    return c.json({
      status: db === "ok" ? "ok" : "degraded",
      service: "tevuly-edge",
      db,
      time: new Date().toISOString(),
    });
  });

  return api;
}