

# Teefuly Build Plan — Phased Approach

You've outlined three sequential focus areas. I'll tackle them in order, with the design system foundation built alongside Phase 1 (since ProductCard depends on it).

## Phase 1 — Design System + Pixel-Perfect ProductCard

**Design tokens** (`src/index.css` + `tailwind.config.ts`)
- Replace default HSL tokens with the Teefuly palette (converted to HSL for Tailwind compatibility): `--primary: 19 88% 53%` (#F1641E), `--primary-dark`, `--primary-light: 22 100% 96%`, `--secondary: 222 33% 26%` (navy), `--accent: 158 100% 36%` (trust green), `--bg-base: 60 14% 98%`, text/border tokens, three shadow elevations, four radius tiers.
- Load Google Fonts: Playfair Display (display), DM Sans (body), DM Mono (price/tags) via `index.html` preconnect + `<link>`.
- Extend Tailwind: `fontFamily.display/sans/mono`, `boxShadow.sm/md/lg`, `borderRadius.sm/md/lg/full`, full font-size scale (xs→4xl per spec), keyframes for `fade-up`, `pop`, `float`, `shimmer`, `slide-underline`.

**Core UI primitives** (only what ProductCard needs in this phase)
- Refactor `Button` variants to spec: `primary` (orange fill, hover scale 1.02), `secondary` (orange outline → fill), `ghost` (navy → primary-light bg), `danger`, `icon`. Font-weight 600, letter-spacing 0.01em, 200ms ease.
- `src/components/ui/badge-teefuly.tsx` — pill chip with variants: `category`, `bestseller`, `new`, `sale`, `freeShipping`, `madeToOrder`, `eco`. Subtle tinted backgrounds.
- `src/components/ui/star-rating.tsx` — half-star support (SVG with clip-path), accent-green fill, optional interactive mode, `(247)` count rendering.

**ProductCard** (`src/components/product/ProductCard.tsx`) — pixel-perfect to spec
- 1:1 aspect-ratio image container, `overflow-hidden`, `rounded-lg`, lazy `loading="lazy"` with blur placeholder via `bg-muted` shimmer until load.
- Hover: image `scale(1.04)` 250ms; card gets `shadow-md` + `border-hover`.
- Top-left: category Badge absolutely positioned (12px inset).
- Top-right: wishlist heart icon-button (Lucide `Heart`), click animates `scale 1 → 1.3 → 1` with fill toggling to primary orange. State held locally for now (Zustand store comes in a later phase).
- Bottom hover overlay: "Quick View" button slides up from bottom (`translateY(100%) → 0`, 250ms).
- Content area (12px padding):
  - Shop row: 16px circular avatar + shop name in `text-sm text-muted`.
  - Title: `text-base font-medium`, 2-line clamp via `line-clamp-2`.
  - Rating row: StarRating + review count, accent-green stars.
  - Price: `font-mono text-md` (DM Mono), strikethrough compare price if present.
  - "FREE shipping" Badge conditionally rendered.
- Skeleton variant exported alongside (`ProductCardSkeleton`) with shimmer animation for loading states.

**Mock data seed** (`src/lib/mock-data.ts`)
- 20 products across all categories with curated Unsplash URLs (apparel/mugs/posters), realistic titles, prices $14.99–$49.99, ratings 4.3–5.0, tags, shop names, variant data. Shape matches the future Supabase schema so Phase 3 swaps cleanly.
- TypeScript types in `src/lib/types/product.ts`.

**Demo on Index page** — render a 4-column grid of ProductCards using mock data so you can verify pixel-perfection before approving Phase 2.

## Phase 2 — Homepage Hero (after Phase 1 approval)

Will be built in a follow-up message once the ProductCard is signed off. Scope preview:
- Sticky `Header` (logo + search + cart/favorites/auth actions) with scroll shadow.
- Horizontally-scrollable category nav pills with fade indicators.
- 520px Hero: warm radial-gradient mesh background, 55/45 split, Playfair H1, dual CTAs, social proof line, right-side floating product card stack with `float` keyframe animation.
- TrustBar (4-column icon row).

## Phase 3 — Supabase Wiring for Product Listing (after Phases 1 & 2)

- Enable Lovable Cloud, run migration creating `products`, `categories`, `reviews`, `analytics_events` tables matching spec, plus `v_products_active`, `v_trending`, `v_featured` views. RLS: public read on active products/categories/reviews; insert restricted.
- Seed migration loads the mock data into `products` so DB is non-empty out of the gate.
- `src/lib/supabase/queries.ts` — `getProducts({ category?, sort?, filters? })` server-style helper using the generated client.
- New `/shop` route (`src/pages/Shop.tsx`) registered in `App.tsx` above the catch-all.
- Listing page uses TanStack Query `useQuery` to fetch; on `data?.length === 0 || error`, falls back to `MOCK_PRODUCTS` so the page is never blank.
- Skeleton grid during loading, empty-state component if both DB and mock are empty (defensive).

## Technical Notes

- Stack adaptation: brief specifies Next.js 15 — this project is **React 18 + Vite + React Router**. All Next-specific APIs map as: `next/image` → native `<img loading="lazy">` with aspect-ratio CSS, `generateMetadata` → `react-helmet-async`, App Router pages → React Router routes. Server Components are not available; data fetching uses TanStack Query (already installed) on the client. This was confirmed acceptable in the prior turn.
- All colors authored as HSL in `index.css` and consumed via `hsl(var(--token))` — no hard-coded hex in components.
- Strict TS, alt text on every image, focus-visible states on all interactive elements.

## What you'll see after Phase 1

Index page replaced with a clean grid of 8 ProductCards on the warm off-white background, demonstrating: hover scale, wishlist heart pop, quick-view slide-up, category badge, free-shipping badge, half-star ratings, mono-font prices. Ready for your pixel-level feedback before I move to the Hero.

