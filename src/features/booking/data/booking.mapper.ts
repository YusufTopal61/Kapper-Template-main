import type { BookingRow } from "@/shared/lib/supabase/database.types";
import type { BookedService, BookingRecord, BusyBooking } from "../domain/booking.entity";

/** Een databaserij met de gekoppelde dienst, zoals Supabase hem teruggeeft. */
export type BookingRowMetDienst = BookingRow & { services: BookedService | null };

/** Select-lijst waarmee BookingRowMetDienst wordt opgehaald. */
export const BOOKING_MET_DIENST = "*, services(id, naam, prijs, duur_minuten)";

export function naarBookingRecord(rij: BookingRowMetDienst): BookingRecord {
  return {
    id: rij.id,
    service_id: rij.service_id,
    klant_naam: rij.klant_naam,
    klant_email: rij.klant_email,
    klant_telefoon: rij.klant_telefoon,
    datum: rij.datum,
    tijd: rij.tijd,
    status: rij.status,
    notities: rij.notities,
    annuleer_token: rij.annuleer_token,
    services: rij.services,
  };
}

export function naarBusyBooking(rij: {
  id: string;
  tijd: string;
  services: { duur_minuten: number } | null;
}): BusyBooking {
  return { id: rij.id, tijd: rij.tijd, duurMinuten: rij.services?.duur_minuten ?? null };
}
