import type { BookingRecord, BookingWithService, BusyBooking, NewBooking } from "./booking.entity";
import type { AdminBookingUpdate } from "./booking.schema";

export type InsertOutcome = { ok: true } | { ok: false; reason: "slot-taken" };
export type UpdateOutcome =
  { ok: true; booking: BookingRecord } | { ok: false; reason: "slot-taken" };

/** Poort naar de opslag van boekingen. */
export interface BookingRepository {
  /** Afspraken die op deze dag tijd innemen. Server-intern: de publieke flow mag niemands gegevens zien. */
  listBusy(date: string): Promise<BusyBooking[]>;
  /** Nieuwe boeking van een bezoeker. Faalt met `tijdslot-bezet` als iemand net sneller was. */
  insert(newBooking: NewBooking): Promise<InsertOutcome>;

  /** Alle boekingen, onder de rechten van de beheerder. */
  listAll(): Promise<BookingWithService[]>;
  findForAdmin(id: string): Promise<BookingRecord | null>;
  updateAsAdmin(id: string, patch: Omit<AdminBookingUpdate, "id">): Promise<UpdateOutcome>;

  /** Opzoeken via het geheime token uit de annuleerlink. Geen token, geen toegang. */
  findByToken(id: string, token: string): Promise<BookingRecord | null>;
  cancelByToken(id: string, token: string): Promise<void>;
}
