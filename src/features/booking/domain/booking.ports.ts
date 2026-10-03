import type { BookingMailData } from "./booking.entity";

/**
 * Poort naar de berichtgeving rond boekingen. Implementaties mogen nooit
 * gooien: een mislukte mail mag een boeking niet laten falen.
 */
export interface BookingNotifier {
  /** Geeft terug of de bevestiging aan de klant daadwerkelijk is verzonden. */
  bookingCreated(booking: BookingMailData): Promise<{ customerMailSent: boolean }>;
  bookingCancelled(booking: BookingMailData, by: "customer" | "admin"): Promise<void>;
  bookingRescheduled(booking: BookingMailData): Promise<void>;
}

/** Poort naar toevalswaarden, zodat use cases deterministisch te testen zijn. */
export interface IdGenerator {
  newId(): string;
  newToken(): string;
}
