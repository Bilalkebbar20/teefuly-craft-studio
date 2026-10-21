import { describe, it, expect } from "vitest";
import { badRequest, notFound, methodNotAllowed, tooManyRequests, toErrorBody } from "../../infra/errors";
import { sanitizeHeaders } from "../../infra/logger";

describe("ApiError helpers", () => {
  it("builds structured errors", () => {
    expect(notFound("PRODUCT_NOT_FOUND", "gone").status).toBe(404);
    expect(methodNotAllowed("POST", "/x").status).toBe(405);
    expect(tooManyRequests().status).toBe(429);
    const br = badRequest("INVALID_QUERY", "bad", [{ path: "sort", message: "nope" }]);
    expect(br.status).toBe(400);
    expect(br.details).toEqual([{ path: "sort", message: "nope" }]);
  });
});

describe("toErrorBody", () => {
  it("wraps ApiError with requestId", () => {
    const body = toErrorBody(badRequest("BAD", "message"), "rid-1", true);
    expect(body.error).toEqual({
      code: "BAD",
      message: "message",
      requestId: "rid-1",
    });
  });

  it("does not leak internals for unknown errors in production", () => {
    const body = toErrorBody(new Error("secret internal detail"), "rid-1", true);
    expect(body.error.message).toBe("Internal server error");
  });

  it("exposes generic message outside production for debuggability", () => {
    const body = toErrorBody(new Error("secret internal detail"), "rid-1", false);
    expect(body.error.message).toBe("Error: secret internal detail");
  });
});

describe("sanitizeHeaders", () => {
  it("redacts credential-bearing headers by name", () => {
    const h = new Headers({
      authorization: "Bearer abc",
      cookie: "session=xyz",
      "set-cookie": "k=v",
      "x-api-key": "key",
      origin: "https://ok.com",
      "content-type": "application/json",
    });
    const out = sanitizeHeaders(h);
    expect(out.authorization).toBe("<redacted>");
    expect(out.cookie).toBe("<redacted>");
    expect(out["set-cookie"]).toBe("<redacted>");
    expect(out["x-api-key"]).toBe("<redacted>");
    expect(out.origin).toBe("https://ok.com");
    expect(out["content-type"]).toBe("application/json");
  });
});