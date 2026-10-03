import { z } from "zod";

/**
 * Publieke omgevingsvariabelen (NEXT_PUBLIC_ prefix), één keer gevalideerd. Ze
 * belanden in de browser-bundle en mogen dus niets geheims bevatten. Server-
 * variabelen staan in `env.server.ts`.
 *
 * Next.js vervangt `process.env.NEXT_PUBLIC_X` alleen als hij letterlijk zo
 * wordt geschreven — daarom staan de namen hieronder uitgeschreven.
 */

/** Een lege string in .env.local betekent "niet ingesteld". */
const emptyToUndefined = (value: unknown) => (value === "" ? undefined : value);
const optional = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess(emptyToUndefined, schema.optional());

const publicSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: optional(z.string().url()),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: optional(z.string().min(1)),
  NEXT_PUBLIC_PLAUSIBLE_DOMAIN: optional(z.string().min(1)),
});

const publicResult = publicSchema.safeParse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_PLAUSIBLE_DOMAIN: process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN,
});

if (!publicResult.success) {
  // Een ongeldige waarde behandelen we als "niet geconfigureerd": de site toont dan
  // de setup-melding in plaats van een wit scherm.
  console.error(
    "[env] ongeldige publieke omgevingsvariabelen:",
    publicResult.error.flatten().fieldErrors,
  );
}

const publicEnv = publicResult.success ? publicResult.data : {};

export const supabaseUrl = publicEnv.NEXT_PUBLIC_SUPABASE_URL;
export const supabaseAnonKey = publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY;
export const plausibleDomain = publicEnv.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;

/** Is Supabase überhaupt geconfigureerd? Zo niet, tonen we een duidelijke melding. */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export function requirePublicSupabaseConfig() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Supabase is niet geconfigureerd. Zet NEXT_PUBLIC_SUPABASE_URL en NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local (zie .env.example).",
    );
  }
  return { url: supabaseUrl, anonKey: supabaseAnonKey };
}
