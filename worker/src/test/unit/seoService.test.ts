import { describe, it, expect } from "vitest";
import { buildProductSeo, truncateText } from "../../services/seoService";

describe("buildProductSeo", () => {
  const base = {
    title: "Celestial Moon Phases Pocket Tee",
    description: "Charming celestial pocket tee printed in the USA.",
    slug: "celestial-moon-tee",
    image: "https://cdn.example/img.jpg",
    priceCents: 2699,
    compareAtCents: null,
    inStock: true,
    ratingsVerified: false,
    ratingAvg: 4.7,
    ratingCount: 5,
  };

  it("omits AggregateRating when ratings are not verified", () => {
    const { jsonLd } = buildProductSeo(base);
    const obj = jsonLd as Record<string, unknown>;
    expect(obj["@type"]).toBe("Product");
    expect(obj.name).toBe("Celestial Moon Phases Pocket Tee");
    expect(obj["aggregateRating"]).toBeUndefined();
  });

  it("emits AggregateRating only when verified and counted", () => {
    const { jsonLd } = buildProductSeo({ ...base, ratingsVerified: true, ratingAvg: 4.7, ratingCount: 42 });
    const obj = jsonLd as Record<string, unknown>;
    expect(obj["aggregateRating"]).toEqual({ "@type": "AggregateRating", ratingValue: 4.7, reviewCount: 42 });
  });

  it("aggregateRating with zero counts stays hidden even if verified", () => {
    const { jsonLd } = buildProductSeo({ ...base, ratingsVerified: true, ratingCount: 0 });
    expect((jsonLd as Record<string, unknown>)["aggregateRating"]).toBeUndefined();
  });

  it("serializes integer-cent prices as cents/100", () => {
    const { jsonLd } = buildProductSeo({ ...base, priceCents: 2699, compareAtCents: 3299 });
    const offers = (jsonLd as Record<string, unknown>).offers as Record<string, unknown>;
    expect(offers.price).toBe(26.99);
    expect(offers.highPrice).toBe(32.99);
    expect(offers.availability).toBe("https://schema.org/InStock");
  });

  it("marks out-of-stock availability", () => {
    const { jsonLd } = buildProductSeo({ ...base, inStock: false });
    const offers = (jsonLd as Record<string, unknown>).offers as Record<string, unknown>;
    expect(offers.availability).toBe("https://schema.org/OutOfStock");
  });

  it("clamps rating to 1..5", () => {
    const { jsonLd } = buildProductSeo({ ...base, ratingsVerified: true, ratingAvg: 9.99, ratingCount: 3 });
    const agg = (jsonLd as Record<string, unknown>)["aggregateRating"] as Record<string, unknown>;
    expect(agg.ratingValue).toBe(5);
  });

  it("builds stable meta strings", () => {
    const { metaTitle, metaDescription } = buildProductSeo(base);
    expect(metaTitle).toBe("Celestial Moon Phases Pocket Tee | Teefuly");
    expect(metaDescription.length).toBeLessThanOrEqual(155);
  });
});

describe("truncateText", () => {
  it("keeps short text, ellipsizes long text", () => {
    expect(truncateText("hello world")).toBe("hello world");
    const long = "x".repeat(300);
    const out = truncateText(long);
    expect(out.length).toBeLessThanOrEqual(155);
    expect(out.endsWith("…")).toBe(true);
  });
});

describe("JSON-LD determinism", () => {
  it("produces identical output for identical input", () => {
    const a = buildProductSeo({
      title: "T",
      description: "D",
      slug: "t",
      image: null,
      priceCents: 100,
      compareAtCents: null,
      inStock: true,
      ratingsVerified: true,
      ratingAvg: 4.5,
      ratingCount: 10,
    });
    const b = buildProductSeo({
      title: "T",
      description: "D",
      slug: "t",
      image: null,
      priceCents: 100,
      compareAtCents: null,
      inStock: true,
      ratingsVerified: true,
      ratingAvg: 4.5,
      ratingCount: 10,
    });
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });

  it("never emits undefined keys into JSON-LD", () => {
    const { jsonLd } = buildProductSeo({
      title: "T",
      description: "D",
      slug: "t",
      image: null,
      priceCents: 100,
      compareAtCents: null,
      inStock: true,
      ratingsVerified: false,
      ratingAvg: 0,
      ratingCount: 0,
    });
    expect(JSON.parse(JSON.stringify(jsonLd))).toEqual(jsonLd);
  });
});