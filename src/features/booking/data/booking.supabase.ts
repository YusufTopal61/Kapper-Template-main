import "server-only";
import { DatabaseError } from "@/lib/errors";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { BookingRepository } from "../domain/booking.repository";
import { ACTIVE_STATUSES, withoutToken } from "../domain/booking.rules";
import {
  BOOKING_WITH_SERVICE,
  toBookingInsert,
  toBookingRecord,
  toBookingUpdate,
  toBusyBooking,
} from "./booking.mapper";

/** Postgres: unique violation on the time slot index — someone was faster. */
const UNIQUE_VIOLATION = "23505";

export function createSupabaseBookingRepository(): BookingRepository {
  return {
    async listBusy(date) {
      const { data, error } = await getSupabaseAdminClient()
        .from("bookings")
        .select("id, start_time, services(duration_minutes)")
        .eq("booking_date", date)
        .in("status", ACTIVE_STATUSES);

      if (error) throw new DatabaseError("bookings.listBusy", error);
      return data.map(toBusyBooking);
    },

    async insert(newBooking) {
      // Deliberately the anon client: creating a booking then really goes through
      // the public RLS policy, exactly as an external caller would.
      const supabase = await getSupabaseServerClient();
      const { error } = await supabase.from("bookings").insert(toBookingInsert(newBooking));

      if (error) {
        if (error.code === UNIQUE_VIOLATION) return { ok: false, reason: "slot-taken" };
        throw new DatabaseError("bookings.insert", error);
      }
      return { ok: true };
    },

    async listAll() {
      const supabase = await getSupabaseServerClient();
      const { data, error } = await supabase
        .from("bookings")
        .select(BOOKING_WITH_SERVICE)
        .order("booking_date", { ascending: true })
        .order("start_time", { ascending: true });

      if (error) throw new DatabaseError("bookings.listAll", error);
      return data.map(toBookingRecord).map(withoutToken);
    },

    async findForAdmin(id) {
      const supabase = await getSupabaseServerClient();
      const { data, error } = await supabase
        .from("bookings")
        .select(BOOKING_WITH_SERVICE)
        .eq("id", id)
        .maybeSingle();

      if (error) throw new DatabaseError("bookings.findForAdmin", error);
      return data ? toBookingRecord(data) : null;
    },

    async updateAsAdmin(id, patch) {
      const supabase = await getSupabaseServerClient();
      const { data, error } = await supabase
        .from("bookings")
        .update(toBookingUpdate(patch))
        .eq("id", id)
        .select(BOOKING_WITH_SERVICE)
        .single();

      if (error) {
        if (error.code === UNIQUE_VIOLATION) return { ok: false, reason: "slot-taken" };
        throw new DatabaseError("bookings.updateAsAdmin", error);
      }
      return { ok: true, booking: toBookingRecord(data) };
    },

    async findByToken(id, token) {
      // The public has no read access to bookings; the token is the key here.
      const { data, error } = await getSupabaseAdminClient()
        .from("bookings")
        .select(BOOKING_WITH_SERVICE)
        .eq("id", id)
        .eq("cancel_token", token)
        .maybeSingle();

      if (error) throw new DatabaseError("bookings.findByToken", error);
      return data ? toBookingRecord(data) : null;
    },

    async cancelByToken(id, token) {
      const { error } = await getSupabaseAdminClient()
        .from("bookings")
        .update({ status: "cancelled" })
        .eq("id", id)
        .eq("cancel_token", token);

      if (error) throw new DatabaseError("bookings.cancelByToken", error);
    },
  };
}
