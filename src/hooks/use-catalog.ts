/**
 * React Query hooks for the Teefuly catalog.
 * Central cache keys keep the home grid and the hero showcase on one fetch.
 */

import { useQuery } from "@tanstack/react-query";
import {
  fetchProductBySlug,
  fetchProducts,
  type CatalogQuery,
} from "@/lib/catalog-api";

export const catalogKeys = {
  list: (q: CatalogQuery) => ["catalog", "list", q] as const,
  detail: (slug: string) => ["catalog", "detail", slug] as const,
};

export function useProducts(query: CatalogQuery = {}) {
  return useQuery({
    queryKey: catalogKeys.list(query),
    queryFn: () => fetchProducts(query),
    staleTime: 30_000,
  });
}

export function useProductDetail(slug: string | undefined) {
  return useQuery({
    queryKey: catalogKeys.detail(slug ?? ""),
    queryFn: () => fetchProductBySlug(slug as string),
    enabled: slug !== undefined && slug.length > 0,
  });
}