import type { BookingDeps } from "../booking.deps";
import { kanKlantAnnuleren, maakMailData } from "../booking.rules";
import type { CancelByTokenInput } from "../booking.schema";
import { ONGELDIGE_LINK } from "./booking.messages";

/** Klant: annuleren via de link in de mail. Een tweede keer annuleren doet niets en mailt niet opnieuw. */
export async function cancelBookingByToken(
  deps: Pick<BookingDeps, "bookings" | "notifier">,
  input: CancelByTokenInput,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const record = await deps.bookings.findByToken(input.bookingId, input.token);
  if (!record) return { ok: false, error: ONGELDIGE_LINK };

  const mag = kanKlantAnnuleren(record.status);
  if (!mag.ok) return mag;

  await deps.bookings.cancelByToken(record.id, input.token);
  await deps.notifier.bookingCancelled(maakMailData(record, record.services), "klant");

  return { ok: true };
}
