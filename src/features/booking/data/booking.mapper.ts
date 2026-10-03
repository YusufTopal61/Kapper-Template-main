import type { Tables, TablesInsert, TablesUpdate } from "@/lib/supabase/database.types";
import type { BookingRecord, BusyBooking, NewBooking } from "../domain/booking.entity";
import type { AdminBookingUpdate } from "../domain/booking.schema";

/** Select list that joins the booked service onto a booking row. */
export const BOOKING_WITH_SERVICE = "*, services(id, name, price, duration_minutes)";

/** A booking row joined with its service, as Supabase returns it for BOOKING_WITH_SERVICE. */
export type BookingRowWithService = Tables<"bookings"> & {
  services: Pick<Tables<"services">, "id" | "name" | "price" | "duration_minutes"> | null;
};

/**
 * The only place that knows the booking column names. Everything above the
 * data layer works with the camelCase entities from the domain.
 */
export function toBookingRecord(row: BookingRowWithService): BookingRecord {
  return {
    id: row.id,
    serviceId: row.service_id,
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    customerPhone: row.customer_phone,
    date: row.booking_date,
    time: row.start_time,
    status: row.status,
    notes: row.notes,
    cancelToken: row.cancel_token,
    services: row.services
      ? {
          id: row.services.id,
          name: row.services.name,
          price: row.services.price,
          durationMinutes: row.services.duration_minutes,
        }
      : null,
  };
}

export function toBusyBooking(row: {
  id: string;
  start_time: string;
  services: { duration_minutes: number } | null;
}): BusyBooking {
  return {
    id: row.id,
    time: row.start_time,
    durationMinutes: row.services?.duration_minutes ?? null,
  };
}

export function toBookingInsert(booking: NewBooking): TablesInsert<"bookings"> {
  return {
    id: booking.id,
    service_id: booking.serviceId,
    customer_name: booking.customerName,
    customer_email: booking.customerEmail,
    customer_phone: booking.customerPhone,
    booking_date: booking.date,
    start_time: booking.time,
    cancel_token: booking.cancelToken,
  };
}

/** Only the fields that were actually provided end up in the update. */
export function toBookingUpdate(patch: Omit<AdminBookingUpdate, "id">): TablesUpdate<"bookings"> {
  return {
    ...(patch.serviceId !== undefined && { service_id: patch.serviceId }),
    ...(patch.customerName !== undefined && { customer_name: patch.customerName }),
    ...(patch.customerEmail !== undefined && { customer_email: patch.customerEmail }),
    ...(patch.customerPhone !== undefined && { customer_phone: patch.customerPhone }),
    ...(patch.date !== undefined && { booking_date: patch.date }),
    ...(patch.time !== undefined && { start_time: patch.time }),
    ...(patch.status !== undefined && { status: patch.status }),
    ...(patch.notes !== undefined && { notes: patch.notes }),
  };
}
