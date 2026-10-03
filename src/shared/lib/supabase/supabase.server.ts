import "server-only";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { requirePublicSupabaseConfig } from "@/shared/lib/env";
import { requireServiceRoleKey } from "@/shared/lib/env.server";
import type { Database } from "./database.types";

/**
 * Supabase-client die de sessie van de ingelogde beheerder uit de cookies van
 * het huidige request leest. Per request opnieuw aanmaken — nooit hergebruiken
 * tussen requests, anders lek je andermans sessie.
 */
export async function getSupabaseServerClient() {
  const { url, anonKey } = requirePublicSupabaseConfig();
  const opslag = await cookies();

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return opslag.getAll();
      },
      setAll(teZetten) {
        try {
          for (const { name, value, options } of teZetten) opslag.set(name, value, options);
        } catch {
          // In een Server Component mogen geen cookies gezet worden. Dat is
          // prima: proxy.ts ververst de sessie bij elk request.
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
