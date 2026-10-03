import "server-only";
import {
  getSupabaseAdminClient,
  getSupabaseServerClient,
} from "@/shared/lib/supabase/supabase.server";
import { ACTIEVE_STATUSSEN, zonderToken } from "../domain/booking.rules";
import type { BookingRepository } from "../domain/booking.repository";
import {
  BOOKING_MET_DIENST,
  naarBookingRecord,
  naarBusyBooking,
  type BookingRowMetDienst,
} from "./booking.mapper";

/** Postgres: unique violation op het tijdslot-index — iemand was net sneller. */
const UNIQUE_VIOLATION = "23505";

export function createSupabaseBookingRepository(): BookingRepository {
  return {
    async listBusy(datum) {
      const { data, error } = await getSupabaseAdminClient()
        .from("bookings")
        .select("id, tijd, services(duur_minuten)")
        .eq("datum", datum)
        .in("status", ACTIEVE_STATUSSEN);

      if (error) throw error;

      return (data ?? []).map((rij) =>
        naarBusyBooking(
          rij as unknown as { id: string; tijd: string; services: { duur_minuten: number } | null },
        ),
      );
    },

    async insert(nieuw) {
      // Bewust met de anon-client: zo loopt het aanmaken écht door de publieke
      // RLS-policy heen, precies zoals een externe aanroep dat zou doen.
      const supabase = await getSupabaseServerClient();
      const { error } = await supabase.from("bookings").insert(nieuw);

      if (error) {
        if (error.code === UNIQUE_VIOLATION) return { ok: false, reden: "tijdslot-bezet" };
        throw error;
      }
      return { ok: true };
    },

    async listAll() {
      const supabase = await getSupabaseServerClient();
      const { data, error } = await supabase
        .from("bookings")
        .select(BOOKING_MET_DIENST)
        .order("datum", { ascending: true })
        .order("tijd", { ascending: true });

      if (error) throw error;
      return ((data ?? []) as unknown as BookingRowMetDienst[])
        .map(naarBookingRecord)
        .map(zonderToken);
    },

    async findForAdmin(id) {
      const supabase = await getSupabaseServerClient();
      const { data, error } = await supabase
        .from("bookings")
        .select(BOOKING_MET_DIENST)
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      return data ? naarBookingRecord(data as unknown as BookingRowMetDienst) : null;
    },

    async updateAsAdmin(id, patch) {
      const supabase = await getSupabaseServerClient();
      const { data, error } = await supabase
        .from("bookings")
        .update(patch)
        .eq("id", id)
        .select(BOOKING_MET_DIENST)
        .single();

      if (error) {
        if (error.code === UNIQUE_VIOLATION) return { ok: false, reden: "tijdslot-bezet" };
        throw error;
      }
      return { ok: true, boeking: naarBookingRecord(data as unknown as BookingRowMetDienst) };
    },

    async findByToken(id, token) {
      // Het publiek heeft geen leesrechten op bookings; het token is hier de sleutel.
      const { data, error } = await getSupabaseAdminClient()
        .from("bookings")
        .select(BOOKING_MET_DIENST)
        .eq("id", id)
        .eq("annuleer_token", token)
        .maybeSingle();

      if (error) throw error;
      return data ? naarBookingRecord(data as unknown as BookingRowMetDienst) : null;
    },

    async cancelByToken(id, token) {
      const { error } = await getSupabaseAdminClient()
        .from("bookings")
        .update({ status: "geannuleerd" })
        .eq("id", id)
        .eq("annuleer_token", token);

      if (error) throw error;
    },
  };
}
