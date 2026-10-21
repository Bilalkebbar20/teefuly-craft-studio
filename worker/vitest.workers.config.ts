/**
 * Integration test config: full Worker + D1 bindings via
 * @cloudflare/vitest-pool-workers (see vitest.config.ts for defaults).
 */
import { defineWorkersConfig } from "@cloudflare/vitest-pool-workers/config";

export default defineWorkersConfig({
  test: {
    css: false,
    include: ["src/test/integration/**/*.test.ts"],
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