import { describe, it, expect } from "vitest";
import {
  validateProductQuery,
  paginationMeta,
  isValidSlug,
  SORT_SQL,
  MAX_LIMIT,
} from "../../services/catalog-query";
import { SORT_KEYS } from "../../types/canonical";

describe("validateProductQuery", () => {
  it("applies safe defaults", () => {
    const q = validateProductQuery({});
    expect(q).toEqual({ page: 1, limit: 24, sort: "relevance" });
  });

  it("parses typed filters", () => {
    const q = validateProductQuery({
      page: "3",
      limit: "10",
      category: "t-shirts",
      sort: "price_asc",
      featured: "true",
      trending: "false",
      q: "tee",
    });
    expect(q.page).toBe(3);
    expect(q.limit).toBe(10);
    expect(q.category).toBe("t-shirts");
    expect(q.sort).toBe("price_asc");
    expect(q.featured).toBe(true);
    expect(q.trending).toBe(false);
    expect(q.q).toBe("tee");
  });

  it("rejects unknown query keys", () => {
    expect(() => validateProductQuery({ foo: "1" })).toThrow();
  });

  it("rejects invalid sort values", () => {
    expect(() => validateProductQuery({ sort: "bogus" })).toThrow();
  });

  it("clamps limit to MAX_LIMIT", () => {
    expect(() => validateProductQuery({ limit: ".17" })).toThrow();
    expect(() => validateProductQuery({ limit: String(MAX_LIMIT + 1) })).toThrow();
  });

  it("rejects non-integer page", () => {
    expect(() => validateProductQuery({ page: "1.5" })).toThrow();
    expect(() => validateProductQuery({ page: "0" })).toThrow();
  });

  it("belongs-to whitelist: every sort key has SQL", () => {
    for (const key of SORT_KEYS) {
      expect(SORT_SQL[key]).toBeTruthy();
    }
    expect(Object.keys(SORT_SQL).sort()).toEqual([...SORT_KEYS].sort());
  });
});

describe("paginationMeta", () => {
  it("computes pages with clamping", () => {
    expect(paginationMeta(1, 24, 20)).toEqual({ page: 1, limit: 24, total: 20, pages: 1 });
    expect(paginationMeta(9, 5, 10)).toEqual({ page: 2, limit: 5, total: 10, pages: 2 });
  });

  it("handles zero results without divide-by-zero", () => {
    expect(paginationMeta(1, 24, 0)).toEqual({ page: 1, limit: 24, total: 0, pages: 0 });
  });
});

describe("isValidSlug", () => {
  it("accepts kebab-case slugs", () => {
    expect(isValidSlug("vintage-sunset-mountains-tee")).toBe(true);
    expect(isValidSlug("a")).toBe(true);
  });

  it("rejects malformed slugs", () => {
    expect(isValidSlug("")).toBe(false);
    expect(isValidSlug("UPPER")).toBe(false);
    expect(isValidSlug("has space")).toBe(false);
    expect(isValidSlug("has_underscore")).toBe(false);
    expect(isValidSlug("trailing-")).toBe(false);
    expect(isValidSlug("double--dash")).toBe(false);
    expect(isValidSlug("a".repeat(121))).toBe(false);
  });
});