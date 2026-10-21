#!/usr/bin/env bun
/**
 * Generates `seeds/products.sql` from the deterministic seed dataset.
 *
 *   bun run seed:build
 *
 * Output is idempotent (INSERT OR IGNORE on natural/primary keys) so the
 * seed can be replayed in `wrangler d1 execute` without duplication.
 * Category/shop rows use literal keys; products/variants use READABLE
 * ids (p-001…, <id>-vN) so re-runs are always the same rows.
 */

import { writeFileSync } from "node:fs";
import { CATEGORIES, SHOPS, PRODUCTS, VARIANTS, type SeedProduct } from "../src/data/seed";

function sqlStr(v: string | number | null | undefined): string {
  if (v === null || v === undefined) return "NULL";
  if (typeof v === "number") return String(v);
  return `'${v.replace(/'/g, "''")}'`;
}

function sqlJson(rows: string[]): string {
  return sqlStr(JSON.stringify(rows));
}

const stmts: string[] = [];

for (const c of CATEGORIES) {
  stmts.push(
    `INSERT OR IGNORE INTO categories (id, slug, name, parent_id, sort_order, is_active, created_at, updated_at) VALUES (${sqlStr(c.id)}, ${sqlStr(c.slug)}, ${sqlStr(c.name)}, NULL, ${sqlStr(c.sortOrder)}, 1, ${sqlStr(0)}, ${sqlStr(0)});`,
  );
}

for (const s of SHOPS) {
  stmts.push(
    `INSERT OR IGNORE INTO shops (id, slug, name, avatar_url, bio, created_at, updated_at) VALUES (${sqlStr(s.id)}, ${sqlStr(s.slug)}, ${sqlStr(s.name)}, ${sqlStr(s.avatarUrl)}, ${sqlStr(s.bio)}, ${sqlStr(0)}, ${sqlStr(0)});`,
  );
}

for (const p of PRODUCTS) {
  const cat = CATEGORIES.find((c) => c.slug === p.categorySlug);
  if (!cat) throw new Error(`Unknown category slug ${p.categorySlug}`);
  stmts.push(seedProductStmt(p, cat.id));
}

for (const v of VARIANTS) {
  stmts.push(
    `INSERT OR IGNORE INTO print_variants (id, product_id, sync_variant_id, external_id, size, color_name, color_code, title, price_cents, compare_at_cents, is_available, stock, created_at, updated_at) VALUES (${sqlStr(v.id)}, ${sqlStr(v.productId)}, ${sqlStr(v.syncVariantId)}, NULL, ${sqlStr(v.size)}, ${sqlStr(v.colorName)}, ${sqlStr(v.colorCode)}, ${sqlStr(v.title)}, ${sqlStr(v.priceCents)}, ${sqlStr(v.compareAtCents)}, ${sqlStr(v.isAvailable ? 1 : 0)}, ${sqlStr(v.stock)}, ${sqlStr(0)}, ${sqlStr(0)});`,
  );
}

function seedProductStmt(p: SeedProduct, categoryId: string): string {
  return (
    `INSERT OR IGNORE INTO products (id, slug, title, description, category_id, shop_id, price_cents, compare_at_cents, images_json, tags_json, badges_json, rating_avg, rating_count, ratings_verified, sales_count, is_featured, is_trending, is_eco, is_made_to_order, free_shipping, active, in_stock, printful_sync_id, seo_meta_title, seo_meta_description, seo_keywords, created_at, updated_at) VALUES (` +
    [
      sqlStr(p.id),
      sqlStr(p.slug),
      sqlStr(p.title),
      sqlStr(p.description),
      sqlStr(categoryId),
      sqlStr(p.shopId),
      sqlStr(p.priceCents),
      sqlStr(p.compareAtCents),
      sqlJson(p.images),
      sqlJson(p.tags),
      sqlJson(p.badges),
      sqlStr(p.ratingAvg),
      sqlStr(p.ratingCount),
      sqlStr(p.ratingsVerified ? 1 : 0),
      sqlStr(p.salesCount),
      sqlStr(p.isFeatured ? 1 : 0),
      sqlStr(p.isTrending ? 1 : 0),
      sqlStr(p.badges.includes("eco") ? 1 : 0),
      sqlStr(p.madeToOrder ? 1 : 0),
      sqlStr(p.freeShipping ? 1 : 0),
      sqlStr(1),
      sqlStr(p.inStock ? 1 : 0),
      sqlStr(null),
      sqlStr(p.seoMetaTitle),
      sqlStr(p.seoMetaDescription),
      sqlStr(null),
      sqlStr(p.ts),
      sqlStr(p.ts),
    ].join(", ") +
    `);`
  );
}

const header = `-- GENERATED FILE — do not edit by hand.
-- Source of truth: worker/src/data/seed.ts
-- Regenerate with:  bun run seed:build
-- Deterministic + idempotent (INSERT OR IGNORE). Timestamps are fixed
-- SQLite anchors: 0 = "epoch" sentinel for static identity rows, fixed
-- unix seconds for catalog rows, so replays produce byte-identical state.
`;

const body = `${header}
BEGIN;

${stmts.join("\n")}

COMMIT;
`;

writeFileSync(new URL("../seeds/products.sql", import.meta.url).pathname, body, "utf8");
console.log(`[seed:build] wrote seeds/products.sql (${stmts.length} statements)`);