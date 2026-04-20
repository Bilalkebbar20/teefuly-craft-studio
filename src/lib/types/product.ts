export interface ProductShop {
  name: string;
  slug: string;
  avatar: string;
}

export interface ProductVariant {
  sizes?: string[];
  colors?: { name: string; hex: string }[];
}

export type ProductBadge =
  | "bestseller"
  | "new"
  | "sale"
  | "madeToOrder"
  | "eco";

export interface Product {
  id: string;
  slug: string;
  title: string;
  description?: string;
  price_cents: number;
  compare_price?: number | null;
  images: string[];
  category: string;
  tags: string[];
  shop: ProductShop;
  rating_avg: number;
  rating_count: number;
  sales_count: number;
  in_stock: boolean;
  is_featured: boolean;
  is_trending: boolean;
  free_shipping: boolean;
  badges: ProductBadge[];
  variants?: ProductVariant;
  printify_url?: string;
}

export const formatPrice = (cents: number): string =>
  `$${(cents / 100).toFixed(2)}`;
