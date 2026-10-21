/**
 * Deterministic, hand-built SEO payloads.
 *
 * NO fabricated ratings/reviews. AggregateRating is emitted ONLY when
 * `ratings_verified = 1` AND `rating_count > 0`, and `rating_avg` is
 * clamped to 1..5. `offers` carries integer-cent prices. The object is
 * built without Date/localizer output so tests can deep-compare it.
 */

import type { ProductSummary } from "../types/canonical";

export interface SeoInput {
  title: string;
  description: string;
  slug: string;
  image: string | null;
  priceCents: number;
  compareAtCents: number | null;
  inStock: boolean;
  ratingsVerified: boolean;
  ratingAvg: number;
  ratingCount: number;
}

function clampRating(value: number): number {
  const v = Math.round(value * 10) / 10;
  return Math.min(5, Math.max(1, v));
}

export function truncateText(text: string, max = 155): string {
  const trimmed = text.trim().replace(/\s+/g, " ");
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1).trimEnd()}…`;
}

export function buildProductSeo(input: SeoInput): { jsonLd: unknown; metaTitle: string; metaDescription: string } {
  const id = `https://tevuly.com/product/${input.slug}`;
  const metaTitle = `${input.title} | Teefuly`;
  const metaDescription = truncateText(input.description || input.title);

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: input.title,
    description: input.description,
    url: id,
    image: input.image ? [input.image] : undefined,
    brand: { "@type": "Brand", name: "Teefuly" },
    offers: {
      "@type": "Offer",
      url: id,
      priceCurrency: "USD",
      price: input.priceCents / 100,
      availability: input.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      ...(input.compareAtCents !== null ? { highPrice: input.compareAtCents / 100 } : {}),
    },
  };

  if (input.ratingsVerified && input.ratingCount > 0) {
    jsonLd.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: clampRating(input.ratingAvg),
      reviewCount: input.ratingCount,
    };
  }

  // Remove undefined keys for deterministic deep-compare in tests.
  for (const key of Object.keys(jsonLd)) {
    if (jsonLd[key] === undefined) delete jsonLd[key];
  }
  if (jsonLd.offers && (jsonLd.offers as Record<string, unknown>).highPrice === undefined) {
    delete (jsonLd.offers as Record<string, unknown>).highPrice;
  }

  return { jsonLd, metaTitle, metaDescription };
}

export function buildSummaryFromProduct(p: ProductSummary): SeoInput {
  return {
    title: p.title,
    description: "",
    slug: p.slug,
    image: p.images[0] ?? null,
    priceCents: p.price_cents,
    compareAtCents: p.compare_price,
    inStock: p.in_stock,
    ratingsVerified: false,
    ratingAvg: p.rating_avg,
    ratingCount: 0,
  };
}