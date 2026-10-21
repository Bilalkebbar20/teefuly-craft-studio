/**
 * Catalog application service. Owns the read path and SEO composition;
 * delegates persistence/row-mapping to the repository.
 */

import { toProductSummary, toVariantSummary } from "../db/repositories/productRepository";
import type { ProductRepository, ProductDetailRow } from "../db/repositories/productRepository";
import { paginationMeta, type ProductQuery } from "./catalog-query";
import { buildProductSeo, buildSummaryFromProduct } from "./seoService";
import type { PaginationMeta, ProductDetail, ProductSummary } from "../types/canonical";

export interface CatalogListResult {
  items: ProductSummary[];
  pagination: PaginationMeta;
}

export class CatalogService {
  constructor(
    private readonly repo: ProductRepository,
    private readonly publicBaseUrl: string,
  ) {}

  async list(query: ProductQuery): Promise<CatalogListResult> {
    const total = await this.repo.count(query);
    const rows = await this.repo.list(query);
    const items = rows.map(toProductSummary);
    return { items, pagination: paginationMeta(query.page, query.limit, total) };
  }

  async bySlug(slug: string): Promise<ProductDetail | null> {
    const row: ProductDetailRow | null = await this.repo.findBySlug(slug);
    if (!row) return null;

    const summary = toProductSummary(row);
    const variants = (await this.repo.listVariants(summary.id)).map(toVariantSummary);
    const seo = buildProductSeo({
      ...buildSummaryFromProduct(summary),
      description: row.description,
      ratingsVerified: row.ratings_verified === 1,
      ratingAvg: summary.rating_avg,
      ratingCount: summary.rating_count,
    });

    return {
      ...summary,
      description: row.description,
      variants,
      seo: {
        jsonLd: seo.jsonLd,
        metaTitle: row.seo_meta_title ?? seo.metaTitle,
        metaDescription: row.seo_meta_description ?? seo.metaDescription,
        canonical: `${this.publicBaseUrl}/product/${summary.slug}`,
      },
    };
  }
}