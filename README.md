# teefuly-craft-studio

Teefuly is a print-on-demand storefront, rebuilt as an **edge-native
e-commerce app on Cloudflare**: the React SPA is served by the same Worker
that serves the `/api` surface, backed by Cloudflare D1 (SQLite at the
edge). No mock data remains in the SPA — the catalog is read from D1.

```
┌─────────────┐        ┌────────────────────────────────┐
│  React SPA  │──────▶ │  Worker tevuly-edge (Hono)     │
│  Vite·React │  /api  │  ├ /api/health                 │
└─────────────┘        │  ├ /api/products[/:slug]       │
        ▲              │  └ assets binding (this SPA)   │
        └──────────────┴--------------------------------┘
                       │  D1 tevuly-d1 (catalog · orders* · jobs · carts)
                       └  R2 / DO / Queues = paid-tier seams (inert in Phase A)
```

## What works today (Phase A)

* **Real catalog API** — `/api/products`, `/api/products/:slug`, `/api/health`,
  served from D1 with parameterized SQL, zod-validated query whitelists and
  per-origin CORS. Structured error envelopes + request IDs on every response.
* **SPA wired to the API** — the home grid and hero render live D1 data
  through TanStack Query with skeletons; `MOCK_PRODUCTS` and the mock-data
  module were removed from the source tree.
* **SEO** — canonical + JSON-LD `Product` payloads; `AggregateRating` is only
  emitted for `ratings_verified` rows (no fabricated ratings), tested.
* **Security core** — strict CORS allowlist, redacted structured logging,
  per-isolate rate limiting, no-stack error surfaces (see SECURITY.md).
* **Deterministic data pipeline** — `worker/src/data/seed.ts` → generated,
  idempotent `worker/seeds/products.sql` (replay-safe `INSERT OR IGNORE`).

## Layout

```
worker/    Cloudflare Worker (Hono + D1) — strict TS, tests, migrations, seeds
src/       Vite + React SPA (Tailwind + shadcn/ui), consumes /api
.github/   CI: typecheck · unit · integration · seed drift · secret scan · build
```

## Getting started

```bash
npm install                     # install + SPA
cd worker && npm install        # worker deps

# dev (SPA + local worker)
cd worker && npm run dev        # worker + local D1 on :8787 (migrate first, below)
npm run db:migrate:local && npm run db:seed:local
# repo root:
npm run dev                     # SPA on :8080, proxies /api → :8787
```

Production deploy runbook: `worker/DEPLOYMENT.md`.

## Commands

| Where  | Command                        | Purpose                                   |
|--------|--------------------------------|-------------------------------------------|
| root   | `npm run dev`                  | SPA dev server (proxies /api)             |
| root   | `npm run build`                | SPA production build → `dist/`            |
| worker | `npm run typecheck`            | strict TypeScript check                   |
| worker | `npm run test:unit`            | unit tests (fast)                         |
| worker | `npm run test:integration`     | full worker + D1 tests (workerd)          |
| worker | `npm run db:migrate:local`     | apply migrations to local D1              |
| worker | `npm run db:seed:local`        | seed local D1 (idempotent)                |
| worker | `npm run deploy:free`          | deploy free-tier config                   |
| worker | `npm run seed:build`           | regenerate `seeds/products.sql`           |

## Roadmap

* **Phase A (this repo, deployed)** — catalog edge API + security core + tested data pipeline.
* **Phase B** — Printful Print Added-to-Site (PAS) product sync (`print_variants.sync_variant_id` already the seam), R2 media.
* **Phase C** — cart (D1, guest + optional profile) and PayPal/pay flow with server-priced order creation; DO cart seat for the paid tier.
* **Phase D** — fulfillment + email (`jobs` table → queues), webhook ledgers with hard idempotency keys.
