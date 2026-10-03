import "server-only";
import { z } from "zod";
import { isSupabaseConfigured } from "./env";

/**
 * Server-omgevingsvariabelen, gevalideerd bij het opstarten (zie
 * instrumentation.ts) en daarna uit de cache gelezen. `server-only` zorgt dat
 * dit bestand nooit in de client-bundle belandt. Publieke variabelen staan in `env.ts`.
 */

/** Een lege string in .env.local betekent "niet ingesteld". */
const emptyToUndefined = (value: unknown) => (value === "" ? undefined : value);

const serverSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string({ required_error: "ontbreekt" }).min(1, "ontbreekt"),
  /** Optioneel: zonder key worden mails gelogd in plaats van verstuurd. */
  RESEND_API_KEY: z.string().default(""),
  RESEND_FROM: z.preprocess(emptyToUndefined, z.string().default("Barber <onboarding@resend.dev>")),
  /** Publieke URL van de site: canonical, sitemap, Open Graph en links in e-mails. */
  SITE_URL: z.preprocess(
    emptyToUndefined,
    z.string().url("moet een volledige URL zijn").optional(),
  ),
});

type ServerEnv = z.infer<typeof serverSchema>;
let serverCache: ServerEnv | undefined;

/** Server-only. Gooit één leesbare fout met álle ontbrekende of ongeldige variabelen. */
export function getServerEnv(): ServerEnv {
  if (serverCache) return serverCache;

  const result = serverSchema.safeParse(process.env);
  if (!result.success) {
    const lines = Object.entries(result.error.flatten().fieldErrors).map(
      ([name, errors]) => `  - ${name}: ${(errors ?? []).join(", ")}`,
    );
    throw new Error(
      `Ongeldige of ontbrekende omgevingsvariabelen (zie .env.example):\n${lines.join("\n")}`,
    );
  }

  serverCache = result.data;
  return serverCache;
}

/**
 * Controle bij het opstarten. In productie start de app niet met een ontbrekende
 * variabele; in development waarschuwen we alleen, zodat de setup-melding in de
 * browser zichtbaar blijft.
 */
export function validateEnv(): void {
  const problems: string[] = [];

  try {
    const env = getServerEnv();
    if (process.env.NODE_ENV === "production" && !env.SITE_URL) {
      problems.push("  - SITE_URL: ontbreekt (nodig voor canonical, sitemap en links in e-mails)");
    }
  } catch (error) {
    problems.push(error instanceof Error ? error.message : String(error));
  }

  if (!isSupabaseConfigured) {
    problems.push("  - NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY: ontbreken");
  }

  if (problems.length === 0) return;

  const message = `[env] configuratie onvolledig:\n${problems.join("\n")}`;
  if (process.env.NODE_ENV === "production") throw new Error(message);
  console.warn(message);
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
  SITE_URL: z.preprocess(emptyToUndefined, z.string().url().optional()),
});

/**
 * Basis-URL van de site zonder slash aan het eind, of leeg als hij niet (geldig)
 * is ingesteld. Gooit bewust nooit: metadata en sitemap moeten ook renderen
 * als een andere variabele nog ontbreekt.
 */
export function getSiteUrl(): string {
  const result = siteSchema.safeParse(process.env);
  return (result.success ? (result.data.SITE_URL ?? "") : "").replace(/\/+$/, "");
}
