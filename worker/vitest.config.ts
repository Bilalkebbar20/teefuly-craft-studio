/**
 * Vitest config for the TEVULY Worker.
 * Uses @cloudflare/vitest-pool-workers: tests run against a real Miniflare
 * instance wired to the free-tier bindings declared in wrangler.free.toml.
 */

import { defineWorkersConfig } from "@cloudflare/vitest-pool-workers/config";

export default defineWorkersConfig({
  test: {
    css: false,
    include: ["src/test/**/*.test.ts"],
    poolOptions: {
      workers: {
        singleWorker: true,
        wrangler: { configPath: "./wrangler.free.toml" },
        miniflare: {
          compatibilityDate: "2024-12-01",
          compatibilityFlags: ["nodejs_compat"],
        },
      },
    },
  },
});