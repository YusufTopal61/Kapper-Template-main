import "server-only";
import { logger } from "@/lib/logger";
import { z } from "zod";
import { isSupabaseConfigured } from "./env";

/**
 * Server environment variables, validated at startup (see instrumentation.ts)
 * and read from the cache afterwards. `server-only` makes sure this file never
 * ends up in the client bundle. Public variables live in `env.ts`.
 */

/** An empty string in .env.local means "not set". */
const emptyToUndefined = (value: unknown) => (value === "" ? undefined : value);

const serverSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string({ required_error: "missing" }).min(1, "missing"),
  /** Optional: without a key, mails are logged instead of sent. */
  RESEND_API_KEY: z.string().default(""),
  RESEND_FROM: z.preprocess(emptyToUndefined, z.string().default("Barber <onboarding@resend.dev>")),
  /** Public URL of the site: canonical, sitemap, Open Graph and links in emails. */
  SITE_URL: z.preprocess(emptyToUndefined, z.string().url("must be a full URL").optional()),
});

type ServerEnv = z.infer<typeof serverSchema>;
let serverCache: ServerEnv | undefined;

/** Server-only. Throws one readable error listing all missing or invalid variables. */
export function getServerEnv(): ServerEnv {
  if (serverCache) return serverCache;

  const result = serverSchema.safeParse(process.env);
  if (!result.success) {
    const lines = Object.entries(result.error.flatten().fieldErrors).map(
      ([name, errors]) => `  - ${name}: ${(errors ?? []).join(", ")}`,
    );
    throw new Error(
      `Invalid or missing environment variables (see .env.example):\n${lines.join("\n")}`,
    );
  }

  serverCache = result.data;
  return serverCache;
}

/**
 * Startup check. In production the app does not start with a missing variable;
 * in development we only warn, so the setup notice stays visible in the browser.
 */
export function validateEnv(): void {
  const problems: string[] = [];

  try {
    const env = getServerEnv();
    if (process.env.NODE_ENV === "production" && !env.SITE_URL) {
      problems.push("  - SITE_URL: missing (needed for canonical, sitemap and links in emails)");
    }
  } catch (error) {
    problems.push(error instanceof Error ? error.message : String(error));
  }

  if (!isSupabaseConfigured) {
    problems.push("  - NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: missing");
  }

  if (problems.length === 0) return;

  const message = `[env] incomplete configuration:\n${problems.join("\n")}`;
  if (process.env.NODE_ENV === "production") throw new Error(message);
  logger.warn("env", message);
}

export function requireServiceRoleKey() {
  return getServerEnv().SUPABASE_SERVICE_ROLE_KEY;
}

/** Empty means: log emails instead of sending them. */
export function getResendConfig() {
  const env = getServerEnv();
  return { apiKey: env.RESEND_API_KEY, from: env.RESEND_FROM };
}

const siteSchema = z.object({
  SITE_URL: z.preprocess(emptyToUndefined, z.string().url().optional()),
});

/**
 * Base URL of the site without a trailing slash, or empty when it is not (validly)
 * set. Deliberately never throws: metadata and sitemap must render even when
 * another variable is still missing.
 */
export function getSiteUrl(): string {
  const result = siteSchema.safeParse(process.env);
  return (result.success ? (result.data.SITE_URL ?? "") : "").replace(/\/+$/, "");
}
