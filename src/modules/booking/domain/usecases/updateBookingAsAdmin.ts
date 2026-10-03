import { normaliseerTijd } from "@/modules/settings/domain/opening-hours.rules";
import { metDefaults } from "@/modules/settings/domain/settings.rules";
import type { BookingDeps } from "../booking.deps";
import type { BookingWithService } from "../booking.entity";
import {
  bepaalMailIntentie,
  controleerRooster,
  maakMailData,
  naarBusyRanges,
  STANDAARD_DUUR_MINUTEN,
  zonderToken,
} from "../booking.rules";
import type { AdminBookingUpdate } from "../booking.schema";
import { BEZET_BEHEER } from "./booking.messages";

export type WijzigResultaat =
  { ok: true; boeking: BookingWithService } | { ok: false; error: string };

/** Beheer: een afspraak wijzigen. Verzetten of annuleren stuurt de klant automatisch een mail. */
export async function updateBookingAsAdmin(
  deps: BookingDeps,
  patch: AdminBookingUpdate,
): Promise<WijzigResultaat> {
  await deps.assertAdmin();
  const { id, ...velden } = patch;

  const huidig = await deps.bookings.findForAdmin(id);
  if (!huidig) return { ok: false, error: "Deze boeking bestaat niet meer." };

  const nieuw = {
    status: velden.status ?? huidig.status,
    datum: velden.datum ?? huidig.datum,
    tijd: normaliseerTijd(velden.tijd ?? huidig.tijd),
    service_id: velden.service_id ?? huidig.service_id,
  };

  const dienst = await deps.services.findById(nieuw.service_id);

  // Alleen controleren zolang de afspraak actief blijft; een geannuleerde
  // afspraak hoeft niet meer in het rooster te passen.
  if (nieuw.status !== "geannuleerd") {
    const { openingstijden } = metDefaults(await deps.settings.read());
    const bezet = naarBusyRanges(await deps.bookings.listBusy(nieuw.datum), id);

    const rooster = controleerRooster({
      openingstijden,
      datum: nieuw.datum,
      tijd: nieuw.tijd,
      duurMinuten: dienst?.duur_minuten ?? STANDAARD_DUUR_MINUTEN,
      bezet,
      negeerVerleden: true,
    });

    if (!rooster.ok) {
      return {
        ok: false,
        error: rooster.reden === "buiten-openingstijden" ? rooster.bericht : BEZET_BEHEER,
      };
    }
  }

  const opslag = await deps.bookings.updateAsAdmin(id, {
    ...velden,
    ...(velden.tijd ? { tijd: nieuw.tijd } : {}),
  });
  if (!opslag.ok) return { ok: false, error: BEZET_BEHEER };

  const bijgewerkt = opslag.boeking;
  const intentie = bepaalMailIntentie(huidig, nieuw);

  if (intentie) {
    const mail = maakMailData(bijgewerkt, dienst);
    if (intentie === "geannuleerd") {
      await deps.notifier.bookingCancelled(mail, "beheerder");
    } else {
      await deps.notifier.bookingRescheduled(mail);
    }
  }

  return { ok: true, boeking: zonderToken(bijgewerkt) };
}
