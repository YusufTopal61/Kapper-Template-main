import { normaliseerTijd } from "@/modules/settings/domain/opening-hours.rules";
import { metDefaults } from "@/modules/settings/domain/settings.rules";
import type { BookingDeps } from "../booking.deps";
import type { BoekingResultaat } from "../booking.entity";
import { controleerRooster, maakMailData, naarBusyRanges } from "../booking.rules";
import type { BookingInput } from "../booking.schema";
import { BEZET_PUBLIEK } from "./booking.messages";

/** Publiek: een afspraak maken. De bevestigingsmail is een bijzaak; de afspraak staat dan al. */
export async function createBooking(
  deps: Omit<BookingDeps, "assertAdmin">,
  input: BookingInput,
): Promise<BoekingResultaat> {
  const dienst = await deps.services.findById(input.service_id);
  if (!dienst || !dienst.actief) {
    return { ok: false, error: "Deze dienst is niet meer beschikbaar.", veld: "service_id" };
  }

  const tijd = normaliseerTijd(input.tijd);
  const { openingstijden } = metDefaults(await deps.settings.read());
  const bezet = naarBusyRanges(await deps.bookings.listBusy(input.datum));

  const rooster = controleerRooster({
    openingstijden,
    datum: input.datum,
    tijd,
    duurMinuten: dienst.duur_minuten,
    bezet,
    ...(deps.now ? { nu: deps.now() } : {}),
  });

  if (!rooster.ok) {
    switch (rooster.reden) {
      case "verleden":
        return { ok: false, error: "Dit moment ligt in het verleden.", veld: "tijd" };
      case "buiten-openingstijden":
        return { ok: false, error: rooster.bericht, veld: "tijd" };
      case "bezet":
        return { ok: false, error: BEZET_PUBLIEK, veld: "tijd" };
    }
  }

  const id = deps.ids.newId();
  const token = deps.ids.newToken();

  const opslag = await deps.bookings.insert({
    id,
    service_id: dienst.id,
    klant_naam: input.klant_naam,
    klant_email: input.klant_email,
    klant_telefoon: input.klant_telefoon,
    datum: input.datum,
    tijd,
    annuleer_token: token,
  });

  // De unieke index in de database is de laatste verdediging tegen twee
  // gelijktijdige boekingen op hetzelfde moment.
  if (!opslag.ok) return { ok: false, error: BEZET_PUBLIEK, veld: "tijd" };

  const { klantMailVerzonden } = await deps.notifier.bookingCreated(
    maakMailData(
      {
        id,
        annuleer_token: token,
        klant_naam: input.klant_naam,
        klant_email: input.klant_email,
        klant_telefoon: input.klant_telefoon,
        datum: input.datum,
        tijd,
      },
      dienst,
    ),
  );

  return {
    ok: true,
    boeking: {
      id,
      datum: input.datum,
      tijd,
      dienstNaam: dienst.naam,
      klant_naam: input.klant_naam,
      klant_email: input.klant_email,
    },
    emailVerzonden: klantMailVerzonden,
  };
}
