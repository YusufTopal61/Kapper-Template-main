import { normaliseerTijd } from "@/modules/settings/domain/opening-hours.rules";
import { metDefaults } from "@/modules/settings/domain/settings.rules";
import type { BookingDeps } from "../booking.deps";
import type { BoekingViaToken } from "../booking.entity";
import type { CancelByTokenInput } from "../booking.schema";
import { ONGELDIGE_LINK } from "./booking.messages";

/** Klant: wat staat er voor deze annuleerlink gepland? Geen geldig token, geen gegevens. */
export async function getBookingByToken(
  deps: Pick<BookingDeps, "bookings" | "settings">,
  input: CancelByTokenInput,
): Promise<{ ok: true; boeking: BoekingViaToken } | { ok: false; error: string }> {
  const record = await deps.bookings.findByToken(input.bookingId, input.token);
  if (!record) return { ok: false, error: ONGELDIGE_LINK };

  const instellingen = metDefaults(await deps.settings.read());

  return {
    ok: true,
    boeking: {
      id: record.id,
      klant_naam: record.klant_naam,
      datum: record.datum,
      tijd: normaliseerTijd(record.tijd),
      status: record.status,
      dienstNaam: record.services?.naam ?? "Behandeling",
      prijs: record.services?.prijs ?? null,
      duurMinuten: record.services?.duur_minuten ?? null,
      bedrijfsnaam: instellingen.bedrijfsnaam,
      adres: instellingen.adres,
    },
  };
}
