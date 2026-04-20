# Phase 1 — Foundation + Pixel-Perfect ProductCard

Approved scope with two added quality bars: **performance** (no layout shift, lazy images, GPU-only animations, no re-render storms) and **accessibility** (ARIA labels on every icon-only control, keyboard parity, semantic markup).

## 1. Design tokens

`**src/index.css**` — replace default tokens with Teefuly palette in HSL:

- `--primary: 19 88% 53%` · `--primary-dark: 17 78% 47%` · `--primary-light: 22 100% 96%`
- `--secondary: 222 33% 26%` · `--accent: 158 100% 36%`
- `--background: 60 14% 98%` (warm off-white) · `--card: 0 0% 100%`
- `--foreground: 0 0% 13%` · `--text-secondary: 0 0% 44%` · `--text-muted: 0 0% 63%`
- `--border: 0 0% 92%` · `--border-hover: 0 0% 83%`
- `--radius: 12px` (md), with sm/lg/full also defined
- Three `--shadow-sm/md/lg` variables
- `body` font set to DM Sans; `.font-display` utility for Playfair

`**index.html**` — preconnect + single Google Fonts link for Playfair Display (600/700), DM Sans (400/500/600), DM Mono (500).

`**tailwind.config.ts**` — extend with:

- `fontFamily: { display: ['Playfair Display', 'serif'], sans: ['DM Sans', 'sans-serif'], mono: ['DM Mono', 'monospace'] }`
- Full font-size scale `xs→4xl` per spec (11→64px)
- `boxShadow.sm/md/lg` bound to CSS vars
- `borderRadius.sm/md/lg` (6/12/20px)
- New keyframes: `fade-up`, `heart-pop`, `float`, `shimmer`, `slide-up-overlay`
- Bind to `animation` map

## 2. UI primitives

- `**src/components/ui/button.tsx**` — refactor variants: `default` (orange, hover bg primary-dark + scale 1.02), `secondary` (white + orange border → fills on hover), `ghost` (navy text → primary-light bg), `destructive`, `outline`. Add `font-semibold tracking-[0.01em] transition-all duration-200`.
- `**src/components/ui/badge-teefuly.tsx**` — pill chip; variants: `category`, `bestseller`, `new`, `sale`, `freeShipping`, `madeToOrder`, `eco`. Each with subtle tinted bg (e.g. `bg-accent/10 text-accent`).
- `**src/components/ui/star-rating.tsx**` — SVG with linear-gradient clip for half-stars, accent-green fill, props: `value`, `count?`, `size?`, `interactive?`, `onChange?`. Renders `<div role="img" aria-label="Rated 4.8 out of 5">`.

## 3. ProductCard — pixel-perfect

`**src/lib/types/product.ts**` — `Product` interface matching future Supabase schema (id, slug, title, price_cents, compare_price?, images[], shop {name, avatar}, rating_avg, rating_count, category, free_shipping, badges[]).

`**src/components/product/ProductCard.tsx**`

Structure:

```text
<article> (group, focus-within ring)
  <div aspect-square relative overflow-hidden rounded-md>
    <img loading="lazy" decoding="async" + bg-muted shimmer until load>
    <Badge category absolute top-3 left-3>
    <button aria-label="Add {title} to favorites" absolute top-3 right-3>
      <Heart /> (animates scale 1→1.3→1 on toggle, fills primary)
    </button>
    <div quick-view overlay translate-y-full group-hover:translate-y-0>
      <Button>Quick View</Button>
    </div>
  </div>
  <div p-3 space-y-1.5>
    <a shop row: 16px avatar + name>
    <h3 line-clamp-2 text-base font-medium>{title}</h3>
    <StarRating + count>
    <div price row: font-mono + optional strike compare + FreeShipping badge>
  </div>
</article>
```

**Performance**:

- `React.memo` on ProductCard with shallow compare
- Wishlist toggle uses local `useState` + `useCallback`
- Animations use `transform`/`opacity` only (GPU); no `width/height` transitions
- `aspect-square` on image container reserves space → zero CLS
- `loading="lazy"` + `decoding="async"` on every product image
- Image hover scale lives on `<img>`, not parent → no layout reflow

**Accessibility**:

- Root is `<article>` with `aria-labelledby` pointing to title
- Title wrapped in `<a>` covering the card via `::after` pseudo (whole-card click without nesting interactive elements)
- Heart button: `aria-label="Add to favorites" / "Remove from favorites"` + `aria-pressed`
- Quick View button: `aria-label="Quick view {title}"`
- Star rating: `role="img"` with descriptive `aria-label`
- Shop avatar `<img>` with alt = shop name
- `focus-visible:ring-2 ring-primary` on all interactive elements
- Quick-view overlay shown on hover **and** focus-within so keyboard users get parity
- `prefers-reduced-motion`: media query in `index.css` disables transforms/keyframes

`**ProductCardSkeleton**` exported from same file: shimmer keyframe over square + text bars.

## 4. Mock data

`**src/lib/mock-data.ts**` — 20 products, curated Unsplash URLs (apparel/mugs/posters/totes/cases), realistic titles, prices $14.99–$49.99, ratings 4.3–5.0, mix of `is_trending`/`is_featured`/`free_shipping`/compare prices, shop names with avatars. Same shape as Supabase schema for clean Phase 3 swap.

## 5. Demo page

`**src/pages/Index.tsx**` — replace placeholder with:

- Warm off-white background (`bg-background`)
- Container with header line ("ProductCard — Phase 1 Preview" in Playfair)
- Responsive grid: `grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6`
- Render 8 ProductCards from mock data
- One row of `ProductCardSkeleton` below to verify loading state

## File map

```text
src/
  index.css                              (rewrite tokens)
  index.html                             (font links)
  tailwind.config.ts                     (extend)
  components/
    ui/
      button.tsx                         (refactor variants)
      badge-teefuly.tsx                  (new)
      star-rating.tsx                    (new)
    product/
      ProductCard.tsx                    (new, memoized)
      ProductCardSkeleton.tsx            (new — co-located export)
  lib/
    types/product.ts                     (new)
    mock-data.ts                         (new)
  pages/
    Index.tsx                            (rewrite as demo grid)
```

## Out of scope for Phase 1

Header, Hero, category nav, footer, routing for /shop or /product, Lovable Cloud, Zustand stores. These are Phases 2–3 once you sign off on the card. ​"Please execute Phase 1 of the Teefuly project based on the following technical specification. Focus on absolute fidelity to the design tokens and the performance/accessibility bars. Do not proceed to the Hero or Header yet; I want to see the 8-card grid demo first."