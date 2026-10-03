import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Separate from next.config.ts: domain and use-case logic runs without a
// framework, a database or a browser — which is exactly what this enforces.
export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  test: { include: ["src/**/*.test.ts"], environment: "node" },
});
