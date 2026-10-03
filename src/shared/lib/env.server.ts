import "server-only";
import { z } from "zod";
import { isSupabaseConfigured } from "./env";

/**
 * Server-omgevingsvariabelen, gevalideerd bij het opstarten (zie
 * instrumentation.ts) en daarna uit de cache gelezen. `server-only` zorgt dat
 * dit bestand nooit in de client-bundle belandt. Publieke variabelen staan in `env.ts`.
 */

/** Een lege string in .env.local betekent "niet ingesteld". */
const leegIsUndefined = (waarde: unknown) => (waarde === "" ? undefined : waarde);

const serverSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string({ required_error: "ontbreekt" }).min(1, "ontbreekt"),
  /** Optioneel: zonder key worden mails gelogd in plaats van verstuurd. */
  RESEND_API_KEY: z.string().default(""),
  RESEND_FROM: z.preprocess(leegIsUndefined, z.string().default("Barber <onboarding@resend.dev>")),
  /** Publieke URL van de site: canonical, sitemap, Open Graph en links in e-mails. */
  SITE_URL: z.preprocess(leegIsUndefined, z.string().url("moet een volledige URL zijn").optional()),
});

type ServerEnv = z.infer<typeof serverSchema>;
let servercache: ServerEnv | undefined;

/** Server-only. Gooit één leesbare fout met álle ontbrekende of ongeldige variabelen. */
export function getServerEnv(): ServerEnv {
  if (servercache) return servercache;

  const resultaat = serverSchema.safeParse(process.env);
  if (!resultaat.success) {
    const regels = Object.entries(resultaat.error.flatten().fieldErrors).map(
      ([naam, fouten]) => `  - ${naam}: ${(fouten ?? []).join(", ")}`,
    );
    throw new Error(
      `Ongeldige of ontbrekende omgevingsvariabelen (zie .env.example):\n${regels.join("\n")}`,
    );
  }

  servercache = resultaat.data;
  return servercache;
}

/**
 * Controle bij het opstarten. In productie start de app niet met een ontbrekende
 * variabele; in development waarschuwen we alleen, zodat de setup-melding in de
 * browser zichtbaar blijft.
 */
export function controleerEnv(): void {
  const problemen: string[] = [];

  try {
    const env = getServerEnv();
    if (process.env.NODE_ENV === "production" && !env.SITE_URL) {
      problemen.push("  - SITE_URL: ontbreekt (nodig voor canonical, sitemap en links in e-mails)");
    }
  } catch (error) {
    problemen.push(error instanceof Error ? error.message : String(error));
  }

  if (!isSupabaseConfigured) {
    problemen.push("  - NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY: ontbreken");
  }

  if (problemen.length === 0) return;

  const bericht = `[env] configuratie onvolledig:\n${problemen.join("\n")}`;
  if (process.env.NODE_ENV === "production") throw new Error(bericht);
  console.warn(bericht);
}

export function requireServiceRoleKey() {
  return getServerEnv().SUPABASE_SERVICE_ROLE_KEY;
}

/** Leeg betekent: e-mails loggen in plaats van versturen. */
export function getResendConfig() {
  const env = getServerEnv();
  return { apiKey: env.RESEND_API_KEY, from: env.RESEND_FROM };
}

const siteSchema = z.object({
  SITE_URL: z.preprocess(leegIsUndefined, z.string().url().optional()),
});

/**
 * Basis-URL van de site zonder slash aan het eind, of leeg als hij niet (geldig)
 * is ingesteld. Gooit bewust nooit: metadata en sitemap moeten ook renderen
 * als een andere variabele nog ontbreekt.
 */
export function getSiteUrl(): string {
  const resultaat = siteSchema.safeParse(process.env);
  return (resultaat.success ? (resultaat.data.SITE_URL ?? "") : "").replace(/\/+$/, "");
}
