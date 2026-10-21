/**
 * Typed client for the Teefuly Edge API (`/api/*`).
 *
 * Same-origin in production (the Worker serves both the SPA and the API);
 * in dev, Vite proxies `/api` to the local Worker on port 8787.
 * Every response is runtime-validated with zod — malformed upstream data
 * can never crash ProductCard rendering paths.
 */

import { z } from "zod";
import type { Product, ProductBadge, ProductShop } from "@/lib/types/product";

const BRAND_SCHEMA = z.enum(["bestseller", "new", "sale", "madeToOrder", "eco"]);

const shopSchema = z.object({
  slug: z.string(),
  name: z.string(),
  avatar_url: z.string().nullable().optional(),
});

const productSummarySchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  price_cents: z.number().int().nonnegative(),
  compare_price: z.number().int().nonnegative().nullable(),
  images: z.array(z.string().url()),
  category: z.string(),
  category_slug: z.string(),
  tags: z.array(z.string()),
  badges: z.array(BRAND_SCHEMA),
  shop: shopSchema,
  rating_avg: z.number().min(0).max(5),
  rating_count: z.number().int().nonnegative(),
  sales_count: z.number().int().nonnegative(),
  free_shipping: z.boolean(),
  is_featured: z.boolean(),
  is_trending: z.boolean(),
  in_stock: z.boolean(),
});

const listResponseSchema = z.object({
  data: z.array(productSummarySchema),
  pagination: z.object({
    page: z.number().int(),
    limit: z.number().int(),
    total: z.number().int().nonnegative(),
    pages: z.number().int().nonnegative(),
  }),
});

export interface CatalogListResponse {
  products: Product[];
  pagination: { page: number; limit: number; total: number; pages: number };
}

export interface CatalogQuery {
  page?: number;
  limit?: number;
  category?: string;
  sort?: "relevance" | "newest" | "price_asc" | "price_desc" | "popular" | "rating";
  featured?: boolean;
  trending?: boolean;
  q?: string;
}

/** API ProductSummary -> SPA `Product` (ProductCard contract). */
function toProduct(d: {
  id: string;
  slug: string;
  title: string;
  price_cents: number;
  compare_price: number | null;
  images: string[];
  category: string;
  tags: string[];
  badges: readonly ProductBadge[];
  shop: { slug: string; name: string; avatar_url: string | null | undefined };
  rating_avg: number;
  rating_count: number;
  sales_count: number;
  free_shipping: boolean;
  is_featured: boolean;
  is_trending: boolean;
  in_stock: boolean;
}): Product {
  const shop: ProductShop = {
    slug: d.shop.slug,
    name: d.shop.name,
    avatar: d.shop.avatar_url ?? "",
  };
  return {
    id: d.id,
    slug: d.slug,
    title: d.title,
    price_cents: d.price_cents,
    compare_price: d.compare_price,
    images: d.images,
    category: d.category,
    tags: d.tags,
    badges: [...d.badges],
    shop,
    rating_avg: d.rating_avg,
    rating_count: d.rating_count,
    sales_count: d.sales_count,
    in_stock: d.in_stock,
    is_featured: d.is_featured,
    is_trending: d.is_trending,
    free_shipping: d.free_shipping,
  };
}

export class CatalogApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string | undefined,
    message: string,
  ) {
    super(message);
    this.name = "CatalogApiError";
  }
}

async function parseError(res: Response): Promise<never> {
  let code = "UNKNOWN";
  let message = `Request failed with status ${res.status}`;
  try {
    const body: unknown = await res.json();
    if (body && typeof body === "object" && "error" in body) {
      const err = (body as { error: { code?: string; message?: string } }).error;
      code = err.code ?? code;
      message = err.message ?? message;
    }
  } catch {
    // non-JSON error body — fall back to the generic message
  }
  throw new CatalogApiError(res.status, code, message);
}

/** GET /api/products — paged catalog list. */
export async function fetchProducts(query: CatalogQuery = {}): Promise<CatalogListResponse> {
  const params = new URLSearchParams();
  if (query.page !== undefined) params.set("page", String(query.page));
  if (query.limit !== undefined) params.set("limit", String(query.limit));
  if (query.category) params.set("category", query.category);
  if (query.sort) params.set("sort", query.sort);
  if (query.featured !== undefined) params.set("featured", String(query.featured));
  if (query.trending !== undefined) params.set("trending", String(query.trending));
  if (query.q) params.set("q", query.q);

  const res = await fetch(`/api/products${params.size ? `?${params}` : ""}`);
  if (!res.ok) {
    await parseError(res);
  }
  const parsed = listResponseSchema.parse(await res.json());
  return {
    products: parsed.data.map(toProduct),
    pagination: parsed.pagination,
  };
}

export async function fetchProductBySlug(slug: string): Promise<Product> {
  const res = await fetch(`/api/products/${encodeURIComponent(slug)}`);
  if (!res.ok) {
    await parseError(res);
  }
  const body: unknown = await res.json();
  const detailSchema = productSummarySchema.extend({
    description: z.string(),
  });
  const parsed = z.object({ data: detailSchema }).parse(body);
  return toProduct(parsed.data);
}