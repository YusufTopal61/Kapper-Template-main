import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { requirePublicSupabaseConfig } from "@/lib/env";
import type { Database } from "./database.types";

/**
 * Supabase client that reads the signed-in admin's session from the current
 * request's cookies. Create it anew per request — never reuse it between
 * requests, or you leak someone else's session.
 */
export async function getSupabaseServerClient() {
  const { url, publishableKey } = requirePublicSupabaseConfig();
  const saveResult = await cookies();

  return createServerClient<Database>(url, publishableKey, {
    cookies: {
      getAll() {
        return saveResult.getAll();
      },
      setAll(toSet) {
        try {
          for (const { name, value, options } of toSet) saveResult.set(name, value, options);
        } catch {
          // In een Server Component mogen geen cookies gezet worden. Dat is
          // prima: proxy.ts ververst de sessie bij elk request.
        }
      },
    },
  });
}
