import { createBrowserClient } from "@supabase/ssr";
import { requirePublicSupabaseConfig } from "@/lib/env";
import type { Database } from "./types";

let browserClient: ReturnType<typeof createBrowserClient<Database>> | undefined;

/**
 * Supabase-client voor de browser. Gebruikt de anon key, dus alles wat hij mag
 * wordt bepaald door Row Level Security. Wordt alleen gebruikt voor de
 * auth-sessie van de beheerder; alle data loopt via server functions.
 */
export function getSupabaseBrowserClient() {
  if (!browserClient) {
    const { url, anonKey } = requirePublicSupabaseConfig();
    browserClient = createBrowserClient<Database>(url, anonKey);
  }
  return browserClient;
}
