import { createClient } from "@supabase/supabase-js";
import type { Database } from "../../../src/lib/supabase/database.types";

/**
 * Service-role client for E2E setup and cleanup only (reading the cancel token
 * of a booking the test just made, which only exists in an email). It never
 * ships with the app; tests that need it skip themselves when it is not configured.
 */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const hasDatabaseAccess = Boolean(url && serviceRoleKey);

export function getTestDatabase() {
  if (!url || !serviceRoleKey) throw new Error("Supabase env is not configured for E2E tests");
  return createClient<Database>(url, serviceRoleKey, { auth: { persistSession: false } });
}

/** The cancel token of the newest booking for this customer email. */
export async function findCancelLink(customerEmail: string) {
  const { data, error } = await getTestDatabase()
    .from("bookings")
    .select("id, annuleer_token")
    .eq("klant_email", customerEmail)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error) throw error;
  return `/boeking/annuleren/${data.id}?token=${data.annuleer_token}`;
}
