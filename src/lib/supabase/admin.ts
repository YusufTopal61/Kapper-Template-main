import "server-only";
import { createClient } from "@supabase/supabase-js";
import { requirePublicSupabaseConfig } from "@/lib/env";
import { requireServiceRoleKey } from "@/lib/env.server";
import type { Database } from "./database.types";

/**
 * Client with the service role key: bypasses Row Level Security entirely.
 *
 * Only use where it is really needed and access is secured another way —
 * cancelling via a secret token, and reading settings to be able to send
 * emails. Never call from the browser.
 */
export function getSupabaseAdminClient() {
  const { url } = requirePublicSupabaseConfig();
  return createClient<Database>(url, requireServiceRoleKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
