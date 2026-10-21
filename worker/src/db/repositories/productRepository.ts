/**
 * Product catalog repository — parameterized SQL only.
 * Row shapes and DTO mapping live here; the service layer stays pure.
 */

import type { D1Client } from "../client";
import { orderBySql } from "../../services/catalog-query";
import type { ProductQuery } from "../../services/catalog-query";
import type { ProductSummary, VariantSummary, ProductBadge } from "../../types/canonical";
import type { ShopSummary } from "../../types/canonical";

export interface ProductListRow {
  id: string;
  slug: string;
  title: string;
  price_cents: number;
  compare_at_cents: number | null;
  images_json: string;
  tags_json: string;
  badges_json: string;
  rating_avg: number;
  rating_count: number;
  sales_count: number;
  free_shipping: number;
  is_featured: number;
  is_trending: number;
  in_stock: number;
  category_name: string;
  category_slug: string;
  shop_id: string;
  shop_slug: string;
  shop_name: string;
  shop_avatar: string | null;
}

export interface ProductDetailRow extends ProductListRow {
  description: string;
  ratings_verified: number;
  seo_meta_title: string | null;
  seo_meta_description: string | null;
}

export interface VariantRow {
  id: string;
  sync_variant_id: string;
  size: string | null;
  color_name: string | null;
  color_code: string | null;
  title: string | null;
  price_cents: number;
  compare_at_cents: number | null;
  is_available: number;
  stock: number | null;
}

function parseJsonArray<T>(raw: string): T[] {
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

const ALLOWED_BADGES: readonly string[] = ["bestseller", "new", "sale", "madeToOrder", "eco"];

function parseBadges(raw: string): ProductBadge[] {
  return parseJsonArray<string>(raw).filter(
    (b): b is ProductBadge => ALLOWED_BADGES.includes(b),
  );
}

export function toProductSummary(row: ProductListRow): ProductSummary {
  const shop: Pick<ShopSummary, "slug" | "name" | "avatar_url"> = {
    slug: row.shop_slug,
    name: row.shop_name,
    avatar_url: row.shop_avatar,
  };
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    price_cents: row.price_cents,
    compare_price: row.compare_at_cents,
    images: parseJsonArray<string>(row.images_json),
    category: row.category_name,
    category_slug: row.category_slug,
    tags: parseJsonArray<string>(row.tags_json),
    badges: parseBadges(row.badges_json),
    shop,
    rating_avg: row.rating_avg,
    rating_count: row.rating_count,
    sales_count: row.sales_count,
    free_shipping: row.free_shipping === 1,
    is_featured: row.is_featured === 1,
    is_trending: row.is_trending === 1,
    in_stock: row.in_stock === 1,
  };
}

export function toVariantSummary(row: VariantRow): VariantSummary {
  return {
    id: row.id,
    sync_variant_id: row.sync_variant_id,
    size: row.size,
    color_name: row.color_name,
    color_code: row.color_code,
    title: row.title,
    price_cents: row.price_cents,
    compare_at_cents: row.compare_at_cents,
    is_available: row.is_available === 1,
    stock: row.stock,
  };
}

type SqlValue = string | number | null;

export interface CatalogFilter {
  category?: string;
  featured?: boolean;
  trending?: boolean;
  q?: string;
}

/** Builds a WHERE fragment + positional params from trusted filters. */
export function buildWhere(filters: CatalogFilter): { where: string[]; params: SqlValue[] } {
  const where = ["p.active = 1"];
  const params: SqlValue[] = [];
  if (filters.category) {
    where.push("c.slug = ?");
    params.push(filters.category);
  }
  if (filters.featured !== undefined) {
    where.push(filters.featured ? "p.is_featured = 1" : "p.is_featured = 0");
  }
  if (filters.trending !== undefined) {
    where.push(filters.trending ? "p.is_trending = 1" : "p.is_trending = 0");
  }
  if (filters.q) {
    where.push(
      "(instr(lower(p.title), lower(?)) > 0 OR instr(lower(coalesce(p.description, '')), lower(?)) > 0)",
    );
    params.push(filters.q, filters.q);
  }
  return { where, params };
}

const LIST_SELECT = `
SELECT p.id, p.slug, p.title, p.price_cents, p.compare_at_cents, p.images_json,
       p.tags_json, p.badges_json, p.rating_avg, p.rating_count, p.sales_count,
       p.free_shipping, p.is_featured, p.is_trending, p.in_stock,
       c.name AS category_name, c.slug AS category_slug,
       s.id AS shop_id, s.slug AS shop_slug, s.name AS shop_name, s.avatar_url AS shop_avatar
FROM products p
JOIN categories c ON c.id = p.category_id
JOIN shops s ON s.id = p.shop_id
`;

export class ProductRepository {
  constructor(private readonly client: D1Client) {}

  async count(filters: CatalogFilter): Promise<number> {
    const { where, params } = buildWhere(filters);
    return this.client.count(`SELECT COUNT(*) AS n FROM products p JOIN categories c ON c.id = p.category_id JOIN shops s ON s.id = p.shop_id WHERE ${where.join(" AND ")}`, params);
  }

  async list(query: ProductQuery): Promise<ProductListRow[]> {
    const { where, params } = buildWhere(query);
    const offset = (query.page - 1) * query.limit;
    const rows = await this.client.all<ProductListRow>(
      `${LIST_SELECT} WHERE ${where.join(" AND ")} ORDER BY ${orderBySql(query.sort)} LIMIT ? OFFSET ?`,
      [...params, query.limit, offset],
    );
    return rows;
  }

  async findBySlug(slug: string): Promise<ProductDetailRow | null> {
    return this.client.first<ProductDetailRow>(
      `${LIST_SELECT.replace("p.images_json", "p.images_json, p.description, p.ratings_verified, p.seo_meta_title, p.seo_meta_description")}
       WHERE p.slug = ? AND p.active = 1`,
      [slug],
    );
  }

  async listVariants(productId: string): Promise<VariantRow[]> {
    return this.client.all<VariantRow>(
      `SELECT id, sync_variant_id, size, color_name, color_code, title, price_cents, compare_at_cents, is_available, stock
       FROM print_variants WHERE product_id = ? ORDER BY price_cents ASC, id ASC`,
      [productId],
    );
  }
}