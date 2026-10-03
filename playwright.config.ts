import { defineConfig, devices } from "@playwright/test";

// Playwright does not read .env.local on its own (Next.js does that for the app).
// process.loadEnvFile is built into Node 22, so no extra dependency is needed.
try {
  process.loadEnvFile(".env.local");
} catch {
  // No .env.local (for example in CI): the environment is expected to be set already.
}

const PORT = 3000;
const isCI = Boolean(process.env.CI);

/**
 * E2E tests for the critical flows. Locally they use the installed Google
 * Chrome, so no browser download is needed. In CI, install Chromium first:
 * `pnpm exec playwright install --with-deps chromium`.
 */
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false, // the booking tests share a database, so they run one after another
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  reporter: isCI ? "github" : "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "on-first-retry",
    ...(isCI ? {} : { channel: "chrome" }),
  },
  projects: [
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"], ...(isCI ? {} : { channel: "chrome" }) },
    },
    // Mobile first: the same flows at phone size.
    { name: "mobile", use: { ...devices["Pixel 7"], ...(isCI ? {} : { channel: "chrome" }) } },
  ],
  webServer: {
    command: "pnpm dev",
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !isCI,
    timeout: 120_000,
  },
});
