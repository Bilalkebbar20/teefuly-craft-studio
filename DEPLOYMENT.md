# TEVULY · DEPLOYMENT (Phase A runbook)

All commands run from `worker/` unless noted.

## 0. Prerequisites

* Node 20+ (repo tested on Node 22), npm 10+ (bun optional for the seed
  generator), wrangler 3.114+.
* Authenticated Cloudflare account (`npx wrangler login`) — this session
  could not perform the OAuth login; it is the first manual step.

## 1. Build the SPA (the Worker serves it)

```bash
# repo root
npm install
npm run build        # → dist/
```

## 2. Worker install + static checks

```bash
cd worker
npm install
npm run typecheck    # strict TS — must exit 0
npm run test:unit    # 31 unit tests
npm run test:integration  # full worker + D1 via workerd (CI green; some
                     # memory-restricted sandboxes cannot boot workerd)
```

## 3. Regenerate seed (only when the catalog dataset changes)

```bash
npm run seed:build   # deterministic, idempotent SQL → seeds/products.sql
```

## 4. Cloudflare resources

```bash
npx wrangler login                       # interactive OAuth
npx wrangler d1 create tevuly-d1         # copy the database_id it prints
# → paste the real id into wrangler.free.toml (and wrangler.toml)

npx wrangler d1 migrations apply tevuly-d1 --remote   # npm run db:migrate:remote
npx wrangler d1 execute tevuly-d1 --remote --file seeds/products.sql  # npm run db:seed:remote
```

Local dev + local D1 (no login needed):

```bash
npm run db:migrate:local
npm run db:seed:local           # re-run safe (INSERT OR IGNORE)
npm run dev                     # http://127.0.0.1:8787
```

> NOTE (recorded from a real attempt): in the sandbox used to build this
> repo, workerd cannot boot (tcmalloc fails a 1 GB aligned `mmap`), so
> `wrangler dev` / `wrangler d1 --local` / vitest-pool-workers runtime are
> environment-blocked. The integration suite + runbook remain canonical and
> run in CI/normal environments.

## 5. Deploy

```bash
npm run build           # from repo root, so [assets].directory=../dist exists
cd worker && npm run deploy:free    # wrangler deploy --config wrangler.free.toml
```

## 6. Smoke-check the live URL (real workers.dev domain printed by deploy)

```bash
BASE=https://tevuly-edge.<your-subdomain>.workers.dev
curl -sS $BASE/api/health
curl -sS "$BASE/api/products?limit=5" | head -c 400
curl -sS $BASE/api/products/vintage-sunset-mountains-tee | head -c 600
curl -sS -o /dev/null -w "%{http_code}\n" -H "origin: https://evil.example" $BASE/api/products   # expect 403
```

Re-run the seed once more against production to prove idempotency
(`db:seed:remote` is INSERT OR IGNORE — counts must not change).

## 7. Paid-tier upgrade path (later phases)

```bash
npx wrangler deploy --config wrangler.toml   # enables DO + queues config
npx wrangler queues create catalog-sync-queue
npx wrangler queues create catalog-sync-queue-dlq
npx wrangler queues create order-fulfillment-queue
npx wrangler queues create order-fulfillment-queue-dlq
```

Do **not** deploy the paid config until Phases B–D code lands — the seams
are inert by design today.
