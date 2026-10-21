/**
 * GET /api/products — catalog read path.
 *   GET /api/products          => paged list (filters: category, sort, q, featured, trending)
 *   GET /api/products/:slug    => product detail + SEO
 *
 * Validation is fail-fast: unknown query keys, bad sort values, or an
 * invalid slug produce structured 4xx errors — never SQL interpolation.
 */

import { Hono } from "hono";
import type { WorkerEnv } from "../env";
import { validateProductQuery, isValidSlug } from "../services/catalog-query";
import type { ZodError } from "zod";
import { badRequest, notFound, tooManyRequests } from "../infra/errors";
import { FixedWindowRateLimiter, clientIp } from "../infra/rateLimit";

function zodDetails(err: ZodError): { path: string; message: string }[] {
  return err.issues.map((i) => ({ path: i.path.join("."), message: i.message }));
}

export function productsRoutes(): Hono<{ Bindings: WorkerEnv }> {
  const api = new Hono<{ Bindings: WorkerEnv }>();
  const limiter = new FixedWindowRateLimiter();

  api.use("*", async (c, next) => {
    if (!limiter.allow(clientIp(c)).ok) {
      throw tooManyRequests();
    }
    await next();
  });

  api.get("/", async (c) => {
    let query;
    try {
      query = validateProductQuery(c.req.query());
    } catch (err) {
      if (err instanceof Error && "issues" in err) {
        throw badRequest("INVALID_QUERY", "Invalid query parameters", zodDetails(err as ZodError));
      }
      throw badRequest("INVALID_QUERY", "Invalid query parameters");
    }
    const result = await c.get("catalog").list(query);
    return c.json({
      data: result.items,
      pagination: result.pagination,
    });
  });

  api.get("/:slug", async (c) => {
    const slug = c.req.param("slug");
    if (!isValidSlug(slug)) {
      throw badRequest("INVALID_SLUG", "Product slug is malformed");
    }
    const detail = await c.get("catalog").bySlug(slug);
    if (!detail) {
      throw notFound("PRODUCT_NOT_FOUND", `Product '${slug}' not found`);
    }
    return c.json({ data: detail });
  });

  return api;
}