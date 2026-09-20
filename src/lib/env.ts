/**
 * Toegang tot omgevingsvariabelen.
 *
 * Publieke waarden komen uit `import.meta.env` (VITE_ prefix, belandt in de
 * browser-bundle). Geheimen komen uit `process.env` en worden pas op het moment
 * van gebruik gelezen — Vite inlined die niet, dus ze kunnen niet in de
 * client-bundle lekken, zelfs niet per ongeluk.
 */

export const supabaseUrl = import.meta.env["VITE_SUPABASE_URL"] as string | undefined;
export const supabaseAnonKey = import.meta.env["VITE_SUPABASE_ANON_KEY"] as string | undefined;

/** Is Supabase überhaupt geconfigureerd? Zo niet, tonen we een duidelijke melding. */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export function requirePublicSupabaseConfig() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Supabase is niet geconfigureerd. Zet VITE_SUPABASE_URL en VITE_SUPABASE_ANON_KEY in .env.local (zie .env.example).",
    );
  }
  return { url: supabaseUrl, anonKey: supabaseAnonKey };
}

/** Server-only. Gooit een leesbare fout als de service role key ontbreekt. */
export function requireServiceRoleKey() {
  const key = process.env["SUPABASE_SERVICE_ROLE_KEY"];
  if (!key) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY ontbreekt. Zet hem in .env.local (zie .env.example).",
    );
  }
  return key;
}

/** Server-only. Leeg betekent: e-mails loggen in plaats van versturen. */
export function getResendConfig() {
  return {
    apiKey: process.env["RESEND_API_KEY"] ?? "",
    from: process.env["RESEND_FROM"] || "Barber <onboarding@resend.dev>",
  };
}

export function getSiteUrlOverride() {
  return process.env["SITE_URL"] || "";
}
