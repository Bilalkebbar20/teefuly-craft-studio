/**
 * Per-isolate in-memory rate limiter (fixed window).
 *
 * Cloudflare Workers free tier has no edge rate-limit binding; this is a
 * lightweight per-isolate guard keyed by client IP. It is NOT a global
 * limiter — on the Paid tier an edge Rate Limiting rule / Durable Object
 * becomes the authoritative limiter. Bounded memory: expired windows are
 * pruned on touch.
 */

export const RATE_LIMIT_MAX_DEFAULT = 120;
export const RATE_LIMIT_WINDOW_MS = 60_000;

interface Bucket {
  count: number;
  resetAt: number;
}

/** Exportable for tests. */
export class FixedWindowRateLimiter {
  private buckets = new Map<string, Bucket>();
  private readonly max: number;
  private readonly windowMs: number;

  constructor(max = RATE_LIMIT_MAX_DEFAULT, windowMs = RATE_LIMIT_WINDOW_MS) {
    this.max = max;
    this.windowMs = windowMs;
  }

  /** Prune all expired windows. */
  prune(now: number): void {
    for (const [key, bucket] of this.buckets) {
      if (bucket.resetAt <= now) this.buckets.delete(key);
    }
  }

  /**
   * Returns true if the key is allowed to proceed, consuming one unit.
   */
  allow(key: string, now = Date.now()): { ok: boolean; retryAfterSec: number } {
    this.prune(now);
    const bucket = this.buckets.get(key);
    if (!bucket || bucket.resetAt <= now) {
      this.buckets.set(key, { count: 1, resetAt: now + this.windowMs });
      return { ok: true, retryAfterSec: 0 };
    }
    if (bucket.count >= this.max) {
      return { ok: false, retryAfterSec: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)) };
    }
    bucket.count += 1;
    return { ok: true, retryAfterSec: 0 };
  }
}

export function clientIp(c: import("hono").Context): string {
  return (
    c.req.header("cf-connecting-ip") ??
    c.req.header("x-real-ip") ??
    c.req.header("x-forwarded-for")?.split(",")[0]?.trim() ??
    "local"
  );
}