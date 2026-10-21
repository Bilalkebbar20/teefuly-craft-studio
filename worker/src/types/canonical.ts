/**
 * TEVULY canonical catalog/API types.
 *
 * The API contract deliberately mirrors the existing frontend `Product`
 * interface (snake_case fields) so the SPA ProductCard works unchanged.
 * Prices are integer cents. Timestamps integers (unix seconds).
 */

export interface ShopSummary {
  id: string;
  slug: string;
  name: string;
  avatar_url: string | null;
}

export type ProductBadge = "bestseller" | "new" | "sale" | "madeToOrder" | "eco";

export interface ProductSummary {
  id: string;
  slug: string;
  title: string;
  price_cents: number;
  compare_price: number | null;
  images: string[];
  category: string;
  category_slug: string;
  tags: string[];
  badges: ProductBadge[];
  shop: Pick<ShopSummary, "slug" | "name" | "avatar_url">;
  rating_avg: number;
  rating_count: number;
  sales_count: number;
  free_shipping: boolean;
  is_featured: boolean;
  is_trending: boolean;
  in_stock: boolean;
}

export interface VariantSummary {
  id: string;
  sync_variant_id: string;
  size: string | null;
  color_name: string | null;
  color_code: string | null;
  title: string | null;
  price_cents: number;
  compare_at_cents: number | null;
  is_available: boolean;
  stock: number | null;
}

export interface SeoPayload {
  jsonLd: unknown;
  metaTitle: string | null;
  metaDescription: string | null;
  canonical: string;
}

export interface ProductDetail extends ProductSummary {
  description: string;
  variants: VariantSummary[];
  seo: SeoPayload;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export const SORT_KEYS = ["relevance", "newest", "price_asc", "price_desc", "popular", "rating"] as const;
export type SortKey = (typeof SORT_KEYS)[number];

export function isSortKey(value: string): value is SortKey {
  return (SORT_KEYS as readonly string[]).includes(value);
}

export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    requestId?: string;
    details?: unknown;
  };
}