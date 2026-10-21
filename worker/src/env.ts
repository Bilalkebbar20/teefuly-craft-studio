/**
 * Validated runtime configuration.
 *
 * Centralized, zod-validated, fail-fast. Bindings (D1/R2/ASSETS) are
 * injected by Cloudflare; only `vars` are validated here. Secrets are
 * never read here — they arrive via `wrangler secret put` and are read
 * exclusively inside their feature adapter (PayPal/Printful/Resend).
 */

import { z } from "zod";

export const APP_ENV_VALUES = ["development", "test", "production"] as const;
export type AppEnv = (typeof APP_ENV_VALUES)[number];

const ConfigSchema = z.object({
  APP_ENV: z.enum(APP_ENV_VALUES),
  PUBLIC_BASE_URL: z.string().url(),
  CORS_ORIGINS: z.string().min(1),
});

export type Config = z.infer<typeof ConfigSchema>;

/**
 * Bindings + vars received by the Worker. Also carries the early
 * Paid-tier seam bindings (undeclared on the free config => undefined).
 */
export interface WorkerEnv {
  TEVULY_D1: D1Database;
  TEVULY_MEDIA?: R2Bucket;
  ASSETS?: Fetcher;
  CART_MANAGER_DO?: DurableObjectNamespace;
  CATALOG_SYNC_QUEUE?: Queue<unknown>;
  ORDER_FULFILLMENT_QUEUE?: Queue<unknown>;
  APP_ENV?: string;
  PUBLIC_BASE_URL?: string;
  CORS_ORIGINS?: string;
  [key: string]: unknown;
}

export class ConfigError extends Error {
  readonly cause?: z.ZodError;
  constructor(message: string, cause?: z.ZodError) {
    super(message);
    this.name = "ConfigError";
    this.cause = cause;
  }
}

/** Parse + validate runtime vars. Throws ConfigError on invalid config. */
export function loadConfig(env: WorkerEnv): Config {
  const parsed = ConfigSchema.safeParse({
    APP_ENV: env.APP_ENV ?? "development",
    PUBLIC_BASE_URL: env.PUBLIC_BASE_URL,
    CORS_ORIGINS: env.CORS_ORIGINS,
  });
  if (!parsed.success) {
    throw new ConfigError(
      `Invalid worker configuration: ${parsed.error.issues.map((i) => `${i.path.join(".")} ${i.message}`).join("; ")}`,
      parsed.error,
    );
  }
  return parsed.data;
}

export function isProduction(cfg: Config): boolean {
  return cfg.APP_ENV === "production";
}