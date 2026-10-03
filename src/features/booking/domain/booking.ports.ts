import type { BookingMailData } from "./booking.entity";

/**
 * Port to the messaging around bookings. Implementations must never throw:
 * a failed mail must not make a booking fail.
 */
export interface BookingNotifier {
  /** Returns whether the confirmation to the customer was actually sent. */
  bookingCreated(booking: BookingMailData): Promise<{ customerMailSent: boolean }>;
  bookingCancelled(booking: BookingMailData, by: "customer" | "admin"): Promise<void>;
  bookingRescheduled(booking: BookingMailData): Promise<void>;
}

/** Port to random values, so use cases can be tested deterministically. */
export interface IdGenerator {
  newId(): string;
  newToken(): string;
}
