# TEVULY · SECURITY

> Status: Phase A security core implemented and tested. Payments/PII land
> in Phases B–C and inherit these controls.

## Controls implemented (Phase A)

| # | Control | Where |
|---|---------|-------|
| 1 | SQL injection: parameterized statements only; composite ORDER BY/FILTER fragments derive from a constant enum map, never user input | `worker/src/db/*`, `worker/src/services/catalog-query.ts` (tested) |
| 2 | Input validation: zod `.strict()` schemas on every query param — unknown keys, bad ranges and malformed slugs are rejected with 400 | `catalog-query.ts` (tested) |
| 3 | CORS: strict origin allowlist (`CORS_ORIGINS` + prod baseUrl). Disallowed origins get 403 `CORS_ORIGIN_NOT_ALLOWED`; preflights honored only for allowed origins; `Vary: Origin` always set | `worker/src/infra/cors.ts` (tested) |
| 4 | Error hygiene: single error envelope `{error:{code,message,requestId}}`; stack traces and internals never serialized (verified for unknown errors in production mode) | `worker/src/infra/errors.ts` (tested) |
| 5 | Log redaction: `authorization`, `cookie`, `set-cookie`, `x-api-key`, `proxy-authorization`, `x-csrf-token` replaced with `<redacted>` | `worker/src/infra/logger.ts` (tested) |
| 6 | Rate limiting: fixed-window per-isolate limiter (default 120 req/min/IP) returning 429; edge-level limits are the Paid-tier seam | `worker/src/infra/rateLimit.ts` (tested) |
| 7 | Secret handling: no secrets committed; permissions documented in `PRINCIPLES/SECURITY` policies; worker reads only validated vars on the hot path | repo-wide scan + CI grep |
| 8 | No fabricated ratings/reviews: JSON-LD `AggregateRating` gated by `ratings_verified = 1 AND rating_count > 0`, values clamped to 1..5 | `worker/src/services/seoService.ts` (tested) |

## Planned (Phases B–D, not active)

* PayPal webhook signature verification (header-validated, fail-closed) and
  hard idempotency via `webhook_events` ledger keys `(source,event_id)`.
* Checkout price authority: prices come from D1 at cart-add time and are
  re-validated server-side at order creation; the client never asserts totals.
* Session/cart integrity via HttpOnly cookies (`SESSION_SECRET` rotation runbook).
* Printful webhook HMAC verification.

## Secret inventory (expected — none present today)

| Secret | Provider | Introduced in |
|--------|----------|---------------|
| PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET / PAYPAL_WEBHOOK_ID | PayPal | Phase C |
| PRINTFUL_API_KEY / PRINTFUL_WEBHOOK_SECRET | Printful | Phase B |
| RESEND_API_KEY | Resend | Phase D |
| SESSION_SECRET | internal | Phase B |

Rotate via `wrangler secret put <NAME>` — zero redeploy needed for secret
reads (Workers re-inject on each isolate start).

## Reporting

Run `gh issue create` in the repo (or contact the maintainers). Never
include captured request IDs + secrets together in the same artifact.
