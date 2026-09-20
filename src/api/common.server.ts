import { getRequestUrl } from "@tanstack/react-start/server";
import { getSiteUrlOverride } from "@/lib/env";
import { getSupabaseAdminClient, getSupabaseServerClient } from "@/lib/supabase/supabase.server";

export const NIET_INGELOGD = "NIET_INGELOGD";

/**
 * Controleert dat er een ingelogde gebruiker is die ook echt in admin_users
 * staat. Gooit bij twijfel — de aanroepende server function stopt dan meteen.
 *
 * Dit is een tweede slot bovenop Row Level Security: ook als deze check ooit
 * vergeten wordt, blokkeert de database de query alsnog.
 */
export async function requireAdmin() {
  const supabase = getSupabaseServerClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error(NIET_INGELOGD);
  }

  const { data: beheerder } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!beheerder) {
    throw new Error(NIET_INGELOGD);
  }

  return { supabase, user };
}

/** Basis-URL van de site, voor links in e-mails. */
export function getSiteUrl(): string {
  const override = getSiteUrlOverride();
  if (override) return override.replace(/\/+$/, "");

  try {
    return getRequestUrl({ xForwardedHost: true, xForwardedProto: true }).origin;
  } catch {
    return "";
  }
}

export function annuleerUrl(bookingId: string, token: string) {
  return `${getSiteUrl()}/boeking/annuleren/${bookingId}?token=${token}`;
}

export function adminBoekingUrl() {
  return `${getSiteUrl()}/admin/boekingen`;
}

/** Cryptografisch veilig token voor de annuleerlink. */
export function maakAnnuleerToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Leest de instellingen met de service role key. Nodig omdat admin_settings
 * bewust geen publieke leesrechten heeft, terwijl de boekingsflow wel de
 * openingstijden en het notificatie-adres moet kennen.
 */
export async function leesInstellingen() {
  const admin = getSupabaseAdminClient();
  const { data, error } = await admin
    .from("admin_settings")
    .select("*")
    .eq("singleton", true)
    .maybeSingle();

  if (error) throw error;
  return data;
}
