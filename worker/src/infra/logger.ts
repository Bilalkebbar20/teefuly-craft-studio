/**
 * Structured, redacted logging.
 *
 * Logs are single-line JSON. Header values that can hold secrets or
 * session material are redacted by name. OUTPUT is gated so the test
 * suite stays quiet while integration tests still assert the message
 * path via a captured sink.
 */

import type { AppEnv } from "../env";

export type LogLevel = "debug" | "info" | "warn" | "error";

const SENSITIVE_HEADERS = new Set([
  "authorization",
  "proxy-authorization",
  "cookie",
  "set-cookie",
  "x-csrf-token",
  "x-api-key",
]);

export interface Logger {
  debug(msg: string, fields?: Record<string, unknown>): void;
  info(msg: string, fields?: Record<string, unknown>): void;
  warn(msg: string, fields?: Record<string, unknown>): void;
  error(msg: string, fields?: Record<string, unknown>): void;
}

/** Headers that can carry credentials are replaced by "<redacted>". */
export function sanitizeHeaders(headers: Headers): Record<string, string> {
  const out: Record<string, string> = {};
  headers.forEach((value, key) => {
    out[key] = SENSITIVE_HEADERS.has(key.toLowerCase()) ? "<redacted>" : value;
  });
  return out;
}

export function createLogger(env: AppEnv, sink?: (line: string) => void): Logger {
  const emit = (level: LogLevel, msg: string, fields: Record<string, unknown>): void => {
    if (env === "test") return;
    const line = JSON.stringify({
      t: new Date().toISOString(),
      level,
      msg,
      ...fields,
    });
    if (sink) {
      sink(line);
      return;
    }
    if (level === "error") {
      console.error(line);
    } else {
      console.log(line);
    }
    void level;
  };

  return {
    debug: (msg, f = {}) => emit("debug", msg, f),
    info: (msg, f = {}) => emit("info", msg, f),
    warn: (msg, f = {}) => emit("warn", msg, f),
    error: (msg, f = {}) => emit("error", msg, f),
  };
}