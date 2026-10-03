import type { BookingMailData } from "./booking.entity";

/**
 * Poort naar de berichtgeving rond boekingen. Implementaties mogen nooit
 * gooien: een mislukte mail mag een boeking niet laten falen.
 */
export interface BookingNotifier {
  /** Geeft terug of de bevestiging aan de klant daadwerkelijk is verzonden. */
  bookingCreated(boeking: BookingMailData): Promise<{ klantMailVerzonden: boolean }>;
  bookingCancelled(boeking: BookingMailData, door: "klant" | "beheerder"): Promise<void>;
  bookingRescheduled(boeking: BookingMailData): Promise<void>;
}

/** Poort naar toevalswaarden, zodat use cases deterministisch te testen zijn. */
export interface IdGenerator {
  newId(): string;
  newToken(): string;
}
