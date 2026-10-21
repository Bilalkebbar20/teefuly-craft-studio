/**
 * Request ID middleware.
 * Assigns a UUID per request, exposes it on `c.var.requestId`, echoes it
 * as `x-request-id`, and threads it into error bodies and logs.
 */

import type { MiddlewareHandler } from "hono";

declare module "hono" {
  interface ContextVariableMap {
    requestId: string;
  }
}

export const requestIdMiddleware: MiddlewareHandler = async (c, next) => {
  const requestId = crypto.randomUUID();
  c.set("requestId", requestId);
  c.header("x-request-id", requestId);
  await next();
};