/**
 * Catalog query parsing + pagination/sort mapping.
 * Pure functions; unit-testable without D1.
 */

import { z } from "zod";
import type { PaginationMeta, SortKey } from "../types/canonical";
import { SORT_KEYS, isSortKey } from "../types/canonical";

export const MAX_LIMIT = 60;
export const DEFAULT_LIMIT = 24;
export const MIN_PAGE = 1;

export const productQuerySchema = z
  .object({
    page: z.coerce.number().int().min(MIN_PAGE).default(1),
    limit: z.coerce.number().int().min(1).max(MAX_LIMIT).default(DEFAULT_LIMIT),
    category: z.string().trim().min(1).max(80).optional(),
    sort: z
      .string()
      .trim()
      .max(20)
      .optional()
      .transform((v) => (v === undefined ? "relevance" : isSortKey(v) ? v : "__invalid__")),
    featured: z.enum(["true", "false"]).optional(),
    trending: z.enum(["true", "false"]).optional(),
    q: z.string().trim().min(1).max(120).optional(),
  })
  .strict()
  .superRefine((data, ctx) => {
    if (data.sort === "__invalid__") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["sort"],
        message: `sort must be one of: ${SORT_KEYS.join(", ")}`,
      });
    }
  });

export type ProductQuery = {
  page: number;
  limit: number;
  category?: string;
  sort: SortKey;
  featured?: boolean;
  trending?: boolean;
  q?: string;
};

export function validateProductQuery(raw: Record<string, unknown>): ProductQuery {
  const result = productQuerySchema.safeParse(raw);
  if (!result.success) throw result.error;
  return {
    page: result.data.page,
    limit: result.data.limit,
    category: result.data.category,
    sort: result.data.sort as SortKey,
    featured: result.data.featured === "true" ? true : result.data.featured === "false" ? false : undefined,
    trending: result.data.trending === "true" ? true : result.data.trending === "false" ? false : undefined,
    q: result.data.q,
  };
}

export const SORT_SQL: Record<SortKey, string> = {
  relevance: "p.is_featured DESC, p.sales_count DESC, p.created_at DESC",
  newest: "p.created_at DESC",
  price_asc: "p.price_cents ASC, p.slug ASC",
  price_desc: "p.price_cents DESC, p.slug ASC",
  popular: "p.sales_count DESC, p.slug ASC",
  rating: "p.rating_avg DESC, p.rating_count DESC, p.slug ASC",
};

export function orderBySql(sort: SortKey): string {
  return SORT_SQL[sort];
}

export function paginationMeta(page: number, limit: number, total: number): PaginationMeta {
  const pages = total === 0 ? 0 : Math.ceil(total / limit);
  const safePage = pages === 0 ? 1 : Math.min(page, pages);
  return { page: safePage, limit, total, pages };
}

export const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const MAX_SLUG_LENGTH = 120;

export function isValidSlug(slug: string): boolean {
  return slug.length > 0 && slug.length <= MAX_SLUG_LENGTH && SLUG_REGEX.test(slug);
}