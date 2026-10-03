import type { AdminGuard } from "@/modules/auth/domain/auth.gateway";
import type { ServiceRepository } from "@/modules/services/domain/service.repository";
import { normaliseerTijd } from "@/modules/settings/domain/opening-hours.rules";
import type { SettingsRepository } from "@/modules/settings/domain/settings.repository";
import { metDefaults } from "@/modules/settings/domain/settings.rules";
import type {
  AdminBookingUpdate,
  BeschikbareSlotenInput,
  BookingInput,
  CancelByTokenInput,
} from "../domain/booking.schema";
import type { BookingNotifier, BookingRepository, IdGenerator } from "../domain/booking.repository";
import {
  bepaalMailIntentie,
  bepaalTijdsloten,
  controleerRooster,
  kanKlantAnnuleren,
  maakMailData,
  naarBusyRanges,
  STANDAARD_DUUR_MINUTEN,
  zonderToken,
} from "../domain/booking.rules";
import type {
  BoekingResultaat,
  BoekingViaToken,
  BookingWithService,
  Tijdslot,
} from "../domain/booking.entity";

export type BookingDeps = {
  bookings: BookingRepository;
  services: Pick<ServiceRepository, "findById">;
  settings: Pick<SettingsRepository, "read">;
  notifier: BookingNotifier;
  ids: IdGenerator;
  assertAdmin: AdminGuard;
  /** Injecteerbaar zodat tijdsafhankelijke regels zonder klok te testen zijn. */
  now?: () => Date;
};

const BEZET_PUBLIEK = "Dit tijdslot is net bezet geraakt. Kies een ander moment.";
const BEZET_BEHEER = "Op dit moment staat al een andere afspraak. Kies een ander tijdslot.";
const ONGELDIGE_LINK = "Deze annuleerlink is niet (meer) geldig.";

// ------------------------------------------------------------ publiek: beschikbaarheid

export async function getAvailableSlots(
  deps: Pick<BookingDeps, "bookings" | "services" | "settings" | "now">,
  input: BeschikbareSlotenInput,
): Promise<{ sloten: Tijdslot[]; gesloten: boolean }> {
  const dienst = await deps.services.findById(input.service_id);
  if (!dienst || !dienst.actief) return { sloten: [], gesloten: true };

  const { openingstijden } = metDefaults(await deps.settings.read());
  const bezet = naarBusyRanges(await deps.bookings.listBusy(input.datum));

  return bepaalTijdsloten({
    openingstijden,
    datum: input.datum,
    duurMinuten: dienst.duur_minuten,
    bezet,
    ...(deps.now ? { nu: deps.now() } : {}),
  });
}

// ------------------------------------------------------------ publiek: boeking maken

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

// ------------------------------------------------------------ beheer

export async function listAdminBookings(
  deps: Pick<BookingDeps, "bookings" | "assertAdmin">,
): Promise<BookingWithService[]> {
  await deps.assertAdmin();
  return deps.bookings.listAll();
}

export type WijzigResultaat =
  { ok: true; boeking: BookingWithService } | { ok: false; error: string };

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

/** Annuleren is een wijziging van de status: zo staan de annuleringsmails op één plek. */
export function cancelBookingAsAdmin(deps: BookingDeps, id: string) {
  return updateBookingAsAdmin(deps, { id, status: "geannuleerd" });
}

// ------------------------------------------------------------ klant: annuleren via link

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
