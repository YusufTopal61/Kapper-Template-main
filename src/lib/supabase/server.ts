import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { requirePublicSupabaseConfig } from "@/lib/env";
import type { Database } from "./database.types";

/**
 * Supabase-client die de sessie van de ingelogde beheerder uit de cookies van
 * het huidige request leest. Per request opnieuw aanmaken — nooit hergebruiken
 * tussen requests, anders lek je andermans sessie.
 */
export async function getSupabaseServerClient() {
  const { url, anonKey } = requirePublicSupabaseConfig();
  const saveResult = await cookies();

  return createServerClient<Database>(url, anonKey, {
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
