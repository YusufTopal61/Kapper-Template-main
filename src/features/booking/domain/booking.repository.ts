import type { BookingRecord, BookingWithService, BusyBooking, NewBooking } from "./booking.entity";
import type { AdminBookingUpdate } from "./booking.schema";

export type InsertOutcome = { ok: true } | { ok: false; reason: "slot-taken" };
export type UpdateOutcome =
  { ok: true; booking: BookingRecord } | { ok: false; reason: "slot-taken" };

/** Port to the storage of bookings. */
export interface BookingRepository {
  /** Appointments that occupy time on this day. Server-internal: the public flow must never see anyone's data. */
  listBusy(date: string): Promise<BusyBooking[]>;
  /** A visitor's new booking. Fails with `slot-taken` if someone was just faster. */
  insert(newBooking: NewBooking): Promise<InsertOutcome>;

  /** All bookings, under the admin's permissions. */
  listAll(): Promise<BookingWithService[]>;
  findForAdmin(id: string): Promise<BookingRecord | null>;
  updateAsAdmin(id: string, patch: Omit<AdminBookingUpdate, "id">): Promise<UpdateOutcome>;

  /** Look up via the secret token from the cancel link. No token, no access. */
  findByToken(id: string, token: string): Promise<BookingRecord | null>;
  cancelByToken(id: string, token: string): Promise<void>;
}
