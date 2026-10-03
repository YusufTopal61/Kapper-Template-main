import { z } from "zod";
import { logger } from "@/lib/logger";

/**
 * Public environment variables (NEXT_PUBLIC_ prefix), validated once. They end
 * up in the browser bundle and so must contain nothing secret. Server
 * variables live in `env.server.ts`.
 *
 * Next.js only replaces `process.env.NEXT_PUBLIC_X` when it is written
 * literally like that — which is why the names are spelled out below.
 */

/** An empty string in .env.local means "not set". */
const emptyToUndefined = (value: unknown) => (value === "" ? undefined : value);
const optional = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess(emptyToUndefined, schema.optional());

const publicSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: optional(z.string().url()),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: optional(z.string().min(1)),
  NEXT_PUBLIC_PLAUSIBLE_DOMAIN: optional(z.string().min(1)),
});

const publicResult = publicSchema.safeParse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  NEXT_PUBLIC_PLAUSIBLE_DOMAIN: process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN,
});

if (!publicResult.success) {
  // We treat an invalid value as "not configured": the site then shows
  // the setup notice instead of a white screen.
  logger.error("env", "invalid public environment variables", undefined, {
    fieldErrors: publicResult.error.flatten().fieldErrors,
  });
}

const publicEnv = publicResult.success ? publicResult.data : {};

export const supabaseUrl = publicEnv.NEXT_PUBLIC_SUPABASE_URL;
export const supabasePublishableKey = publicEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
export const plausibleDomain = publicEnv.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;

/** Is Supabase configured at all? If not, we show a clear notice. */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabasePublishableKey);

export function requirePublicSupabaseConfig() {
  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env.local (see .env.example).",
    );
  }
  return { url: supabaseUrl, publishableKey: supabasePublishableKey };
}
