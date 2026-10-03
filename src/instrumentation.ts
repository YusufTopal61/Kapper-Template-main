/**
 * Runs once when the server starts. In production the app does not start with
 * a missing or invalid environment variable; in development we only warn, so the
 * setup notice stays visible in the browser.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const { validateEnv } = await import("@/lib/env.server");
  validateEnv();
}
