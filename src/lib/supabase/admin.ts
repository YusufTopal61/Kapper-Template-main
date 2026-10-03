import "server-only";
import { createClient } from "@supabase/supabase-js";
import { requirePublicSupabaseConfig } from "@/lib/env";
import { requireServiceRoleKey } from "@/lib/env.server";
import type { Database } from "./database.types";

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
