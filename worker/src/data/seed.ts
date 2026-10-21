/**
 * TEVULY seed dataset — derived from the original frontend mock catalog
 * (`src/lib/mock-data.ts`) so the production SPA keeps the same product
 * identity. Seed values are committed as SQL (`worker/seeds/products.sql`)
 * via `bun run seed:build`.
 *
 * Honesty notes:
 *   * Descriptive copy and design metadata are first-party; the fictional
 *     customers/ratings in the legacy mock are carried as integers ONLY
 *     for parity of the catalog's look — `ratingsVerified` is always
 *     false, so SEO JSON-LD never emits an AggregateRating block.
 *   * sync_variant_id values are local surrogates
 *     (`<slug>/<size>-<color>`). They are replaced by real Printful
 *     SyncVariant IDs during the Phase B catalog import.
 */

export type SeedBadge = "bestseller" | "new" | "sale" | "madeToOrder" | "eco";

export interface SeedCategory {
  id: string;
  slug: string;
  name: string;
  sortOrder: number;
}

export interface SeedShop {
  id: string;
  slug: string;
  name: string;
  avatarUrl: string | null;
  bio: string | null;
}

export interface SeedProduct {
  id: string;
  slug: string;
  title: string;
  description: string;
  categorySlug: string;
  shopId: string;
  priceCents: number;
  compareAtCents: number | null;
  images: string[];
  tags: string[];
  badges: SeedBadge[];
  ratingAvg: number;
  ratingCount: number;
  ratingsVerified: false;
  salesCount: number;
  isFeatured: boolean;
  isTrending: boolean;
  freeShipping: boolean;
  madeToOrder: boolean;
  inStock: boolean;
  seoMetaTitle: string;
  seoMetaDescription: string;
  /** deterministic created_at (unix seconds) */
  ts: number;
}

export interface SeedVariant {
  id: string;
  productId: string;
  syncVariantId: string;
  size: string | null;
  colorName: string | null;
  colorCode: string | null;
  title: string;
  priceCents: number;
  compareAtCents: number | null;
  isAvailable: boolean;
  stock: number | null;
}

export const CATEGORIES: SeedCategory[] = [
  { id: "cat-t-shirts", slug: "t-shirts", name: "T-Shirts", sortOrder: 1 },
  { id: "cat-mugs", slug: "mugs", name: "Mugs", sortOrder: 2 },
  { id: "cat-posters", slug: "posters", name: "Posters", sortOrder: 3 },
  { id: "cat-hoodies", slug: "hoodies", name: "Hoodies", sortOrder: 4 },
  { id: "cat-tote-bags", slug: "tote-bags", name: "Tote Bags", sortOrder: 5 },
  { id: "cat-phone-cases", slug: "phone-cases", name: "Phone Cases", sortOrder: 6 },
  { id: "cat-stickers", slug: "stickers", name: "Stickers", sortOrder: 7 },
  { id: "cat-hats", slug: "hats", name: "Hats", sortOrder: 8 },
];

export const SHOPS: SeedShop[] = [
  { id: "shop-1", slug: "artisanprints", name: "ArtisanPrints", avatarUrl: "https://i.pravatar.cc/64?img=12", bio: null },
  { id: "shop-2", slug: "wildink", name: "WildInk Studio", avatarUrl: "https://i.pravatar.cc/64?img=32", bio: null },
  { id: "shop-3", slug: "northwood", name: "Northwood Goods", avatarUrl: "https://i.pravatar.cc/64?img=47", bio: null },
  { id: "shop-4", slug: "solstice", name: "Solstice Co.", avatarUrl: "https://i.pravatar.cc/64?img=15", bio: null },
  { id: "shop-5", slug: "petalpress", name: "Petal & Press", avatarUrl: "https://i.pravatar.cc/64?img=23", bio: null },
];

const OF = "https://images.unsplash.com/photo-";
const IMG = (photo: string, w = 800) => `${OF}${photo}?auto=format&fit=crop&w=${w}&q=80`;

const CATEGORY_SINGULAR: Record<string, string> = {
  "t-shirts": "giclée printed tee",
  "mugs": "ceramic mug",
  "posters": "giclée art poster",
  "hoodies": "heavyweight hoodie",
  "tote-bags": "canvas tote",
  "phone-cases": "phone case",
  "stickers": "vinyl sticker",
  "hats": "hat",
};

function descriptionFor(title: string, categorySlug: string, shopName: string): string {
  const singular = CATEGORY_SINGULAR[categorySlug] ?? "print-on-demand item";
  return `${title} — a ${singular} printed to order in the USA and designed by ${shopName} exclusively for the Teefuly collection.`;
}

function truncate(text: string, max = 155): string {
  const t = text.trim().replace(/\s+/g, " ");
  return t.length <= max ? t : `${t.slice(0, max - 1).trimEnd()}…`;
}

interface MockProduct {
  id: string;
  slug: string;
  title: string;
  price_cents: number;
  compare_price?: number;
  image: string;
  category: string;
  tags: string[];
  shopIndex: number;
  rating_avg: number;
  rating_count: number;
  sales_count: number;
  featured: boolean;
  trending: boolean;
  free_shipping: boolean;
  badges: SeedBadge[];
}

const MOCKS: MockProduct[] = [
  { id: "p-001", slug: "vintage-sunset-mountains-tee", title: "Vintage Sunset Mountains Tee", price_cents: 2899, compare_price: 3899, image: "1521572163474-6864f9cf17ab", category: "t-shirts", tags: ["nature", "vintage", "outdoors"], shopIndex: 0, rating_avg: 4.8, rating_count: 247, sales_count: 1240, featured: true, trending: true, free_shipping: true, badges: ["bestseller", "sale"] },
  { id: "p-002", slug: "minimalist-cat-portrait-mug", title: "Minimalist Cat Portrait Ceramic Mug", price_cents: 1799, image: "1514228742587-6b1558fcca3d", category: "mugs", tags: ["animals", "minimalist", "gift"], shopIndex: 1, rating_avg: 4.9, rating_count: 512, sales_count: 2100, featured: true, trending: true, free_shipping: true, badges: ["bestseller"] },
  { id: "p-003", slug: "abstract-wave-poster", title: "Abstract Wave Giclée Art Poster", price_cents: 2499, image: "1513519245088-0e12902e5a38", category: "posters", tags: ["abstract", "art", "wall-decor"], shopIndex: 2, rating_avg: 4.7, rating_count: 89, sales_count: 320, featured: false, trending: true, free_shipping: false, badges: ["new"] },
  { id: "p-004", slug: "cozy-forest-hoodie", title: "Cozy Forest Adventures Hoodie", price_cents: 4499, compare_price: 5499, image: "1556821840-3a63f95609a7", category: "hoodies", tags: ["nature", "cozy", "outdoors"], shopIndex: 3, rating_avg: 4.6, rating_count: 178, sales_count: 640, featured: true, trending: false, free_shipping: true, badges: ["sale"] },
  { id: "p-005", slug: "wildflower-tote-bag", title: "Hand-Drawn Wildflower Canvas Tote", price_cents: 1999, image: "1544816155-12df9643f363", category: "tote-bags", tags: ["floral", "eco", "everyday"], shopIndex: 4, rating_avg: 4.9, rating_count: 304, sales_count: 980, featured: false, trending: true, free_shipping: true, badges: ["eco"] },
  { id: "p-006", slug: "retro-arcade-phone-case", title: "Retro Arcade 80s Phone Case", price_cents: 2299, image: "1556656793-08538906a9f8", category: "phone-cases", tags: ["retro", "gaming", "funny"], shopIndex: 1, rating_avg: 4.5, rating_count: 142, sales_count: 410, featured: false, trending: false, free_shipping: false, badges: ["new"] },
  { id: "p-007", slug: "celestial-moon-tee", title: "Celestial Moon Phases Pocket Tee", price_cents: 2699, image: "1503341504253-dff4815485f1", category: "t-shirts", tags: ["celestial", "minimalist", "night"], shopIndex: 0, rating_avg: 4.7, rating_count: 421, sales_count: 1500, featured: true, trending: true, free_shipping: true, badges: ["bestseller"] },
  { id: "p-008", slug: "botanical-line-art-poster", title: "Botanical Line Art Print Set", price_cents: 3299, compare_price: 4299, image: "1490750967868-88aa4486c946", category: "posters", tags: ["botanical", "minimalist", "wall-decor"], shopIndex: 4, rating_avg: 4.8, rating_count: 263, sales_count: 870, featured: true, trending: false, free_shipping: true, badges: ["sale", "madeToOrder"] },
  { id: "p-009", slug: "good-vibes-only-mug", title: "Good Vibes Only Stoneware Mug", price_cents: 1599, image: "1577937927133-66ef06acdf18", category: "mugs", tags: ["typography", "cheerful", "gift"], shopIndex: 2, rating_avg: 4.4, rating_count: 96, sales_count: 230, featured: false, trending: false, free_shipping: false, badges: [] },
  { id: "p-010", slug: "mountain-explorer-hoodie", title: "Mountain Explorer Heavyweight Hoodie", price_cents: 4899, image: "1620799140408-edc6dcb6d633", category: "hoodies", tags: ["outdoors", "warm", "vintage"], shopIndex: 3, rating_avg: 4.9, rating_count: 387, sales_count: 1120, featured: true, trending: true, free_shipping: true, badges: ["bestseller"] },
  { id: "p-011", slug: "sticker-pack-vibes", title: "Indie Vibes Sticker Pack (12 pcs)", price_cents: 1499, image: "1563089145-599997674d42", category: "stickers", tags: ["funny", "pack", "laptop"], shopIndex: 1, rating_avg: 4.6, rating_count: 215, sales_count: 690, featured: false, trending: true, free_shipping: true, badges: ["new"] },
  { id: "p-012", slug: "dad-cap-embroidered", title: "Embroidered Logo Dad Cap", price_cents: 2499, compare_price: 2999, image: "1521369909029-2afed882baee", category: "hats", tags: ["streetwear", "minimal", "everyday"], shopIndex: 0, rating_avg: 4.5, rating_count: 134, sales_count: 410, featured: false, trending: false, free_shipping: true, badges: ["sale"] },
  { id: "p-013", slug: "ocean-wave-tee", title: "Ocean Wave Watercolor Tee", price_cents: 2799, image: "1554568218-0f1715e72254", category: "t-shirts", tags: ["ocean", "watercolor", "summer"], shopIndex: 3, rating_avg: 4.7, rating_count: 198, sales_count: 580, featured: true, trending: false, free_shipping: true, badges: [] },
  { id: "p-014", slug: "pet-portrait-poster", title: "Custom Pet Portrait Art Print", price_cents: 3899, image: "1543466835-00a7907e9de1", category: "posters", tags: ["custom", "pet", "gift"], shopIndex: 4, rating_avg: 5.0, rating_count: 612, sales_count: 1980, featured: true, trending: true, free_shipping: false, badges: ["bestseller", "madeToOrder"] },
  { id: "p-015", slug: "geo-pattern-mug", title: "Geometric Pattern Espresso Mug", price_cents: 1899, image: "1572119865084-43c285814d63", category: "mugs", tags: ["geometric", "espresso", "modern"], shopIndex: 2, rating_avg: 4.6, rating_count: 121, sales_count: 340, featured: false, trending: false, free_shipping: false, badges: [] },
  { id: "p-016", slug: "marble-phone-case", title: "Rose Marble Phone Case", price_cents: 2199, image: "1601784551446-20c9e07cdbdb", category: "phone-cases", tags: ["marble", "elegant", "feminine"], shopIndex: 4, rating_avg: 4.5, rating_count: 87, sales_count: 220, featured: false, trending: false, free_shipping: true, badges: [] },
  { id: "p-017", slug: "skate-club-tee", title: "Underground Skate Club Tee", price_cents: 3199, image: "1583743814966-8936f5b7be1a", category: "t-shirts", tags: ["streetwear", "skate", "graphic"], shopIndex: 1, rating_avg: 4.8, rating_count: 356, sales_count: 980, featured: true, trending: true, free_shipping: true, badges: ["bestseller"] },
  { id: "p-018", slug: "linen-tote-market", title: "Linen Market Tote Bag", price_cents: 2399, image: "1591561954557-26941169b49e", category: "tote-bags", tags: ["linen", "everyday", "eco"], shopIndex: 2, rating_avg: 4.7, rating_count: 142, sales_count: 380, featured: false, trending: false, free_shipping: true, badges: ["eco"] },
  { id: "p-019", slug: "bookworm-sticker", title: "Bookworm Vinyl Sticker", price_cents: 499, image: "1532012197267-da84d127e765", category: "stickers", tags: ["books", "cute", "single"], shopIndex: 4, rating_avg: 4.9, rating_count: 89, sales_count: 410, featured: false, trending: false, free_shipping: false, badges: ["new"] },
  { id: "p-020", slug: "denim-bucket-hat", title: "Washed Denim Bucket Hat", price_cents: 2899, compare_price: 3499, image: "1556306535-0f09a537f0a3", category: "hats", tags: ["denim", "summer", "y2k"], shopIndex: 3, rating_avg: 4.6, rating_count: 167, sales_count: 520, featured: true, trending: true, free_shipping: true, badges: ["sale"] },
];

const APPAREL_SIZES = ["S", "M", "L", "XL"];
const APPAREL_COLOR = { name: "Soft Black", code: "#1b1b1b" };

function variantsFor(m: MockProduct): SeedVariant[] {
  const withSizes = ["t-shirts", "hoodies"].includes(m.category);
  const color = withSizes ? APPAREL_COLOR : { name: "Default", code: null };
  const variantLabels: string[] = withSizes ? APPAREL_SIZES : ["Standard"];

  return variantLabels.map((label, i) => {
    const size = withSizes ? label : null;
    const colorSlug = (color.name ?? "std").toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const sizeSlug = size ? size.toLowerCase() : "std";
    return {
      id: `${m.id}-v${i + 1}`,
      productId: m.id,
      syncVariantId: `${m.slug}/${sizeSlug}-${colorSlug}`,
      size,
      colorName: color.name,
      colorCode: color.code,
      title: withSizes ? `${m.title} — ${label}` : `${m.title} (Standard)`,
      priceCents: m.price_cents,
      compareAtCents: m.compare_price ?? null,
      isAvailable: true,
      stock: null,
    };
  });
}

const TS_BASE = 1722537600; // fixed anchor so seeds are deterministic

export function buildProducts(): SeedProduct[] {
  return MOCKS.map((m, i) => {
    const shop = SHOPS[m.shopIndex];
    const description = descriptionFor(m.title, m.category, shop.name);
    return {
      id: m.id,
      slug: m.slug,
      title: m.title,
      description,
      categorySlug: m.category,
      shopId: shop.id,
      priceCents: m.price_cents,
      compareAtCents: m.compare_price ?? null,
      images: [IMG(m.image)],
      tags: m.tags,
      badges: m.badges,
      ratingAvg: m.rating_avg,
      ratingCount: m.rating_count,
      ratingsVerified: false,
      salesCount: m.sales_count,
      isFeatured: m.featured,
      isTrending: m.trending,
      freeShipping: m.free_shipping,
      madeToOrder: m.badges.includes("madeToOrder"),
      inStock: true,
      seoMetaTitle: `${m.title} | Teefuly`,
      seoMetaDescription: truncate(description),
      ts: TS_BASE + i * 60,
    };
  });
}

// Helper accessor for the SQL generator.
export const PRODUCTS = buildProducts();

// Build one big deterministic variant list.
export const VARIANTS: SeedVariant[] = MOCKS.flatMap((m) => variantsFor(m));