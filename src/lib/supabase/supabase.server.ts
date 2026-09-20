import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { getCookies, setCookie, setResponseHeader } from "@tanstack/react-start/server";
import { requirePublicSupabaseConfig, requireServiceRoleKey } from "@/lib/env";
import type { Database } from "./types";

/**
 * Supabase-client die de sessie van de ingelogde beheerder uit de cookies van
 * het huidige request leest. Per request opnieuw aanmaken — nooit hergebruiken
 * tussen requests, anders lek je andermans sessie.
 */
export function getSupabaseServerClient() {
  const { url, anonKey } = requirePublicSupabaseConfig();

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return Object.entries(getCookies()).map(([name, value]) => ({ name, value }));
      },
      setAll(cookiesToSet, headers) {
        for (const { name, value, options } of cookiesToSet) {
          setCookie(name, value, options);
        }
        // Voorkomt dat een CDN een response mét auth-cookies cachet en die aan
        // een andere bezoeker serveert.
        for (const [key, headerValue] of Object.entries(headers)) {
          setResponseHeader(key as Parameters<typeof setResponseHeader>[0], headerValue);
        }
      },
    },
  });
}

/**
 * Client met de service role key: omzeilt Row Level Security volledig.
 *
 * Alleen gebruiken waar dat echt moet en de toegang op een andere manier is
 * afgedekt — annuleren via een geheim token, en instellingen uitlezen om
 * e-mails te kunnen versturen. Nooit vanuit de browser aanroepen.
 */
export function getSupabaseAdminClient() {
  const { url } = requirePublicSupabaseConfig();

  return createClient<Database>(url, requireServiceRoleKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
