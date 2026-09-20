import { getRequestIP } from "@tanstack/react-start/server";
import { getSupabaseAdminClient } from "@/lib/supabase/supabase.server";
import { rateLimit } from "@/lib/rate-limit";
import type { BookingStatus } from "@/lib/supabase/types";

export type TokenRij = {
  id: string;
  klant_naam: string;
  klant_email: string;
  klant_telefoon: string;
  datum: string;
  tijd: string;
  status: BookingStatus;
  services: { naam: string; prijs: number; duur_minuten: number } | null;
};

/**
 * Zoekt een boeking op id + geheim token. Het token komt uit de annuleerlink
 * in de bevestigingsmail; zonder dat token is een boeking niet op te vragen.
 * Gebruikt de service role key, want het publiek heeft geen leesrechten op
 * bookings.
 */
export async function zoekOpToken(bookingId: string, token: string): Promise<TokenRij | null> {
  const admin = getSupabaseAdminClient();

  const { data, error } = await admin
    .from("bookings")
    .select(
      "id, klant_naam, klant_email, klant_telefoon, datum, tijd, status, services(naam, prijs, duur_minuten)",
    )
    .eq("id", bookingId)
    .eq("annuleer_token", token)
    .maybeSingle();

  if (error) throw error;
  return (data as unknown as TokenRij) ?? null;
}

/** Rem op het raden van annuleertokens. */
export function limietOverschreden(prefix: string) {
  const ip = getRequestIP({ xForwardedFor: true }) ?? "onbekend";
  const limiet = rateLimit(`${prefix}:${ip}`, { max: 20, vensterMs: 10 * 60 * 1000 });
  return !limiet.toegestaan;
}
