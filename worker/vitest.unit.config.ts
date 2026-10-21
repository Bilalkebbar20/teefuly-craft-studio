/** Fast pure-unit test config (Node pool, no Miniflare). */
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    css: false,
    include: ["src/test/unit/**/*.test.ts"],
  },
});