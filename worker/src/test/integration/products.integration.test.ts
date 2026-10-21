import { beforeAll, describe, it, expect } from "vitest";
import { SELF, env } from "cloudflare:test";
import type { ProductDetail, ProductSummary } from "../../types/canonical";
import type { WorkerEnv } from "../../env";

import migrationSql from "../../../migrations/0001_init.sql?raw";
import seedSql from "../../../seeds/products.sql?raw";

const API = "https://tevuly.com";
const db = (env as unknown as WorkerEnv).TEVULY_D1;

/**
 * D1's exec driver treats a leading comment-only line as a bad statement
 * and rejects PRAGMA statements entirely (SQLITE_AUTH). Full-line comments
 * and pragmas are documentative/local-only — strip them for the test
 * runtime. (Real migrations via `wrangler d1 migrations apply` keep them.)
 */
function stripForTestExec(sql: string): string {
  return sql
    .replace(/^\s*--.*$\n?/gm, "")
    .replace(/^\s*PRAGMA[^\n]*$\n?/gim, "");
}

function json<T>(res: Response): Promise<T> {
  return res.json() as Promise<T>;
}

beforeAll(async () => {
  await db.exec(stripForTestExec(migrationSql));
  await db.exec(stripForTestExec(seedSql));
});

describe("GET /api/health", () => {
  it("reports healthy with reachable D1", async () => {
    const res = await SELF.fetch(`${API}/api/health`);
    expect(res.status).toBe(200);
    const body = await json<{ status: string; service: string; db: string }>(res);
    expect(body.status).toBe("ok");
    expect(body.service).toBe("tevuly-edge");
    expect(body.db).toBe("ok");
  });
});

describe("GET /api/products", () => {
  it("returns the full seeded catalog with snake_case contract", async () => {
    const res = await SELF.fetch(`${API}/api/products`);
    expect(res.status).toBe(200);
    const body = await json<{ data: ProductSummary[]; pagination: { total: number; pages: number } }>(res);
    expect(body.pagination.total).toBe(20);
    expect(body.data.length).toBe(20);
    const first = body.data[0];
    expect(first).toMatchObject({
      slug: "vintage-sunset-mountains-tee",
      title: "Vintage Sunset Mountains Tee",
      price_cents: 2899,
      compare_price: 3899,
      free_shipping: true,
      is_featured: true,
      is_trending: true,
      in_stock: true,
    });
    expect(Array.isArray(first.images)).toBe(true);
    expect(Array.isArray(first.tags)).toBe(true);
    expect(Array.isArray(first.badges)).toBe(true);
    expect(first.shop.slug).toBe("artisanprints");
    expect(first.shop.name).toBe("ArtisanPrints");
    expect(first.category_slug).toBe("t-shirts");
  });

  it("filters by category slug", async () => {
    const res = await SELF.fetch(`${API}/api/products?category=t-shirts`);
    const body = await json<{ data: ProductSummary[] }>(res);
    expect(body.data.length).toBe(4);
    for (const p of body.data) expect(p.category_slug).toBe("t-shirts");
  });

  it("filters featured and trending flags", async () => {
    const featured = await json<{ data: ProductSummary[] }>(await SELF.fetch(`${API}/api/products?featured=true`));
    expect(featured.data.length).toBeGreaterThan(0);
    for (const p of featured.data) expect(p.is_featured).toBe(true);

    const trending = await json<{ data: ProductSummary[] }>(await SELF.fetch(`${API}/api/products?trending=true`));
    expect(trending.data.length).toBeGreaterThan(0);
    for (const p of trending.data) expect(p.is_trending).toBe(true);
  });

  it("sorts by price ascending", async () => {
    const res = await SELF.fetch(`${API}/api/products?sort=price_asc`);
    const body = await json<{ data: ProductSummary[] }>(res);
    expect(body.data[0].price_cents).toBe(499);
    const prices = body.data.map((p) => p.price_cents);
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });

  it("paginates correctly", async () => {
    const page1 = await json<{ data: ProductSummary[]; pagination: { page: number; pages: number } }>(
      await SELF.fetch(`${API}/api/products?limit=5&page=1`),
    );
    const page4 = await json<{ data: ProductSummary[]; pagination: { page: number; pages: number } }>(
      await SELF.fetch(`${API}/api/products?limit=5&page=4`),
    );
    expect(page1.data.length).toBe(5);
    expect(page4.data.length).toBe(5);
    expect(page1.pagination.page).toBe(1);
    expect(page4.pagination.page).toBe(4);
    expect(page1.data[0].id).not.toBe(page4.data[0].id);
  });

  it("search-searches title and description safely", async () => {
    const res = await SELF.fetch(`${API}/api/products?q=tee`);
    expect(res.status).toBe(200);
    const body = await json<{ data: ProductSummary[]; pagination: { total: number } }>(res);
    expect(body.pagination.total).toBeGreaterThan(0);
  });
});

describe("GET /api/products/:slug", () => {
  it("returns full detail with print variants and JSON-LD", async () => {
    const res = await SELF.fetch(`${API}/api/products/vintage-sunset-mountains-tee`);
    expect(res.status).toBe(200);
    const { data } = await json<{ data: ProductDetail }>(res);
    expect(data.slug).toBe("vintage-sunset-mountains-tee");
    expect(data.description.length).toBeGreaterThan(20);
    expect(data.variants.length).toBe(4);
    const sizes = data.variants.map((v) => v.size);
    expect(sizes).toEqual(["S", "M", "L", "XL"]);
    for (const v of data.variants) {
      expect(v.price_cents).toBe(2899);
      expect(v.is_available).toBe(true);
      expect(v.sync_variant_id.length).toBeGreaterThan(5);
    }

    const offers = data.seo.jsonLd as { offers: { price: number; availability: string } };
    expect(offers.offers.price).toBe(28.99);
    expect(offers.offers.availability).toBe("https://schema.org/InStock");
    // No fabricated ratings in SEO.
    expect((data.seo.jsonLd as { aggregateRating?: unknown }).aggregateRating).toBeUndefined();
    expect(data.seo.canonical).toBe(`${API}/product/vintage-sunset-mountains-tee`);
  });

  it("404s for unknown slugs", async () => {
    const res = await SELF.fetch(`${API}/api/products/does-not-exist`);
    expect(res.status).toBe(404);
    const body = await json<{ error: { code: string } }>(res);
    expect(body.error.code).toBe("PRODUCT_NOT_FOUND");
  });

  it("rejects malformed slugs with 400", async () => {
    const res = await SELF.fetch(`${API}/api/products/TRAILING-`);
    expect(res.status).toBe(400);
    const body = await json<{ error: { code: string } }>(res);
    expect(body.error.code).toBe("INVALID_SLUG");
  });
});

describe("API security surface", () => {
  it("rejects unknown query keys as 400", async () => {
    const res = await SELF.fetch(`${API}/api/products?evil=1`);
    expect(res.status).toBe(400);
    const body = await json<{ error: { code: string; message: string } }>(res);
    expect(body.error.code).toBe("INVALID_QUERY");
  });

  it("rejects invalid sort values", async () => {
    const res = await SELF.fetch(`${API}/api/products?sort=bogus`);
    expect(res.status).toBe(400);
  });

  it("rejects oversized limits", async () => {
    const res = await SELF.fetch(`${API}/api/products?limit=9999`);
    expect(res.status).toBe(400);
  });

  it("returns structured 404 for unknown API paths", async () => {
    const res = await SELF.fetch(`${API}/api/nope`);
    expect(res.status).toBe(404);
    const body = await json<{ error: { code: string } }>(res);
    expect(body.error.code).toBe("NOT_FOUND");
    expect((body.error as { requestId?: string }).requestId).toBeTruthy();
  });

  it("returns 405 for methods not allowed", async () => {
    const res = await SELF.fetch(`${API}/api/products`, { method: "POST", body: "x" });
    expect(res.status).toBe(405);
  });

  it("tags every API response with x-request-id", async () => {
    const res = await SELF.fetch(`${API}/api/products`);
    expect(res.headers.get("x-request-id")).toBeTruthy();
  });

  it("rejects cross-origin requests from disallowed origins", async () => {
    const res = await SELF.fetch(`${API}/api/products`, {
      headers: { origin: "https://evil.example.com" },
    });
    expect(res.status).toBe(403);
    const body = await json<{ error: { code: string } }>(res);
    expect(body.error.code).toBe("CORS_ORIGIN_NOT_ALLOWED");
  });

  it("serves allowed origins and echoes them", async () => {
    const res = await SELF.fetch(`${API}/api/products`, {
      headers: { origin: "https://tevuly.com" },
    });
    expect(res.status).toBe(200);
    expect(res.headers.get("access-control-allow-origin")).toBe("https://tevuly.com");
    expect(res.headers.get("vary")).toContain("Origin");
  });

  it("answers preflight for allowed origins only", async () => {
    const ok = await SELF.fetch(`${API}/api/products`, {
      method: "OPTIONS",
      headers: { origin: "https://tevuly.com", "access-control-request-method": "GET" },
    });
    expect(ok.status).toBe(204);
    expect(ok.headers.get("access-control-allow-origin")).toBe("https://tevuly.com");

    const block = await SELF.fetch(`${API}/api/products`, {
      method: "OPTIONS",
      headers: { origin: "https://evil.example.com", "access-control-request-method": "GET" },
    });
    expect(block.status).toBe(403);
  });
});

describe("seed idempotency", () => {
  it("replaying the seed changes nothing", async () => {
    await db.exec(seedSql);
    const res = await SELF.fetch(`${API}/api/products`);
    const body = await json<{ pagination: { total: number } }>(res);
    expect(body.pagination.total).toBe(20);
  });
});