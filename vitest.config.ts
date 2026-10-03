import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Los van next.config.ts: domein- en use-case-logica draait zonder framework,
// zonder database en zonder browser — dat is precies wat we hiermee afdwingen.
export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  test: { include: ["src/**/*.test.ts"], environment: "node" },
});
