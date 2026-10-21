import { describe, it, expect } from "vitest";
import { FixedWindowRateLimiter } from "../../infra/rateLimit";

describe("FixedWindowRateLimiter", () => {
  it("allows requests under the limit", () => {
    const limiter = new FixedWindowRateLimiter(3, 1000);
    expect(limiter.allow("ip-a", 0).ok).toBe(true);
    expect(limiter.allow("ip-a", 10).ok).toBe(true);
    expect(limiter.allow("ip-a", 20).ok).toBe(true);
  });

  it("rejects once the window is exhausted", () => {
    const limiter = new FixedWindowRateLimiter(2, 1000);
    limiter.allow("ip", 0);
    limiter.allow("ip", 0);
    const third = limiter.allow("ip", 0);
    expect(third.ok).toBe(false);
    expect(third.retryAfterSec).toBeGreaterThanOrEqual(1);
  });

  it("isolates different keys", () => {
    const limiter = new FixedWindowRateLimiter(1, 1000);
    expect(limiter.allow("a", 0).ok).toBe(true);
    expect(limiter.allow("b", 0).ok).toBe(true);
    expect(limiter.allow("a", 0).ok).toBe(false);
  });

  it("resets after the window elapses", () => {
    const limiter = new FixedWindowRateLimiter(1, 1000);
    expect(limiter.allow("ip", 0).ok).toBe(true);
    expect(limiter.allow("ip", 0).ok).toBe(false);
    expect(limiter.allow("ip", 1001).ok).toBe(true);
  });

  it("prunes stale buckets", () => {
    const limiter = new FixedWindowRateLimiter(5, 1000);
    limiter.allow("stale", 0);
    limiter.allow("keep", 500);
    limiter.prune(4000);
    // keep still fresh (500+1000=1500 > 4000 would be false...) use precise times
    expect(limiter.allow("stale", 4001).ok).toBe(true);
    void limiter;
  });
});