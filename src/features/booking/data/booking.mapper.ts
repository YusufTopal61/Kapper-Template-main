import type { Enums, Tables, TablesInsert, TablesUpdate } from "@/lib/supabase/database.types";
import type {
  BookingRecord,
  BookingStatus,
  BusyBooking,
  NewBooking,
} from "../domain/booking.entity";
import type { AdminBookingUpdate } from "../domain/booking.schema";

/**
 * The live schema uses Dutch column names and enum values. This file is the
 * only place that knows them: everything above the data layer works with the
 * English, camelCase entities from the domain.
 */

type DbStatus = Enums<"booking_status">;

const STATUS_TO_DB: Record<BookingStatus, DbStatus> = {
  confirmed: "bevestigd",
  cancelled: "geannuleerd",
  completed: "voltooid",
  no_show: "no_show",
};

const STATUS_FROM_DB: Record<DbStatus, BookingStatus> = {
  bevestigd: "confirmed",
  geannuleerd: "cancelled",
  voltooid: "completed",
  no_show: "no_show",
};

export const toDbStatus = (status: BookingStatus): DbStatus => STATUS_TO_DB[status];
export const fromDbStatus = (status: DbStatus): BookingStatus => STATUS_FROM_DB[status];

/** Select list that joins the booked service onto a booking row. */
export const BOOKING_WITH_SERVICE = "*, services(id, naam, prijs, duur_minuten)";

/** A booking row joined with its service, as Supabase returns it for BOOKING_WITH_SERVICE. */
export type BookingRowWithService = Tables<"bookings"> & {
  services: Pick<Tables<"services">, "id" | "naam" | "prijs" | "duur_minuten"> | null;
};

export function toBookingRecord(row: BookingRowWithService): BookingRecord {
  return {
    id: row.id,
    serviceId: row.service_id,
    customerName: row.klant_naam,
    customerEmail: row.klant_email,
    customerPhone: row.klant_telefoon,
    date: row.datum,
    time: row.tijd,
    status: fromDbStatus(row.status),
    notes: row.notities,
    cancelToken: row.annuleer_token,
    services: row.services
      ? {
          id: row.services.id,
          name: row.services.naam,
          price: row.services.prijs,
          durationMinutes: row.services.duur_minuten,
        }
      : null,
  };
}

export function toBusyBooking(row: {
  id: string;
  tijd: string;
  services: { duur_minuten: number } | null;
}): BusyBooking {
  return {
    id: row.id,
    time: row.tijd,
    durationMinutes: row.services?.duur_minuten ?? null,
  };
}

export function toBookingInsert(booking: NewBooking): TablesInsert<"bookings"> {
  return {
    id: booking.id,
    service_id: booking.serviceId,
    klant_naam: booking.customerName,
    klant_email: booking.customerEmail,
    klant_telefoon: booking.customerPhone,
    datum: booking.date,
    tijd: booking.time,
    annuleer_token: booking.cancelToken,
  };
}

/** Only the fields that were actually provided end up in the update. */
export function toBookingUpdate(patch: Omit<AdminBookingUpdate, "id">): TablesUpdate<"bookings"> {
  return {
    ...(patch.serviceId !== undefined && { service_id: patch.serviceId }),
    ...(patch.customerName !== undefined && { klant_naam: patch.customerName }),
    ...(patch.customerEmail !== undefined && { klant_email: patch.customerEmail }),
    ...(patch.customerPhone !== undefined && { klant_telefoon: patch.customerPhone }),
    ...(patch.date !== undefined && { datum: patch.date }),
    ...(patch.time !== undefined && { tijd: patch.time }),
    ...(patch.status !== undefined && { status: toDbStatus(patch.status) }),
    ...(patch.notes !== undefined && { notities: patch.notes }),
  };
}
