import {
  dagVanDatum,
  formatDatum,
  ligtInVerleden,
  normaliseerTijd,
  tijdNaarMinuten,
  tijdslotenVoorDag,
  valtBinnenOpeningstijden,
} from "@/modules/settings/domain/opening-hours.rules";
import type { Openingstijden } from "@/modules/settings/domain/settings.entity";
import type {
  BookedService,
  BookingMailData,
  BookingRecord,
  BookingStatus,
  BookingWithService,
  BusyBooking,
  BusyRange,
  Tijdslot,
} from "./booking.entity";

/** Statussen die een tijdslot bezet houden. Een geannuleerde afspraak telt niet mee. */
export const ACTIEVE_STATUSSEN = ["bevestigd", "voltooid", "no_show"] as const;

/** Duur waarmee we rekenen als de gekoppelde dienst ontbreekt. */
export const STANDAARD_DUUR_MINUTEN = 30;

/**
 * Met `negeerId` sluit je de afspraak uit die je zelf aan het verplaatsen
 * bent — die zou anders met zichzelf botsen.
 */
export function naarBusyRanges(bezet: BusyBooking[], negeerId?: string): BusyRange[] {
  return bezet
    .filter((afspraak) => afspraak.id !== negeerId)
    .map((afspraak) => {
      const start = tijdNaarMinuten(normaliseerTijd(afspraak.tijd));
      return { start, eind: start + (afspraak.duurMinuten ?? STANDAARD_DUUR_MINUTEN) };
    });
}

/** Botst een behandeling van `duur` minuten vanaf `start` met iets bestaands? */
export function overlapt(start: number, duur: number, ranges: BusyRange[]): boolean {
  const eind = start + duur;
  return ranges.some((range) => start < range.eind && eind > range.start);
}

/** Tijdsloten voor een dag, met per slot of de behandeling er nog in past. */
export function bepaalTijdsloten(input: {
  openingstijden: Openingstijden;
  datum: string;
  duurMinuten: number;
  bezet: BusyRange[];
  nu?: Date;
}): { sloten: Tijdslot[]; gesloten: boolean } {
  const { openingstijden, datum, duurMinuten, bezet, nu } = input;

  const kandidaten = tijdslotenVoorDag(openingstijden, datum, duurMinuten);
  if (kandidaten.length === 0) return { sloten: [], gesloten: true };

  const sloten = kandidaten.map((tijd) => ({
    tijd,
    beschikbaar:
      !ligtInVerleden(datum, tijd, nu) && !overlapt(tijdNaarMinuten(tijd), duurMinuten, bezet),
  }));

  return { sloten, gesloten: false };
}

export type RoosterUitkomst =
  | { ok: true }
  | { ok: false; reden: "verleden" }
  | { ok: false; reden: "buiten-openingstijden"; bericht: string }
  | { ok: false; reden: "bezet" };

/**
 * Past deze afspraak in het rooster? De volgorde is bewust: eerst het verleden,
 * dan de openingstijden, dan pas of iemand anders het tijdslot al heeft.
 * De beheerder mag een afspraak in het verleden bewerken (`negeerVerleden`).
 */
export function controleerRooster(input: {
  openingstijden: Openingstijden;
  datum: string;
  tijd: string;
  duurMinuten: number;
  bezet: BusyRange[];
  negeerVerleden?: boolean;
  nu?: Date;
}): RoosterUitkomst {
  const { openingstijden, datum, duurMinuten, bezet, negeerVerleden, nu } = input;
  const tijd = normaliseerTijd(input.tijd);

  if (!negeerVerleden && ligtInVerleden(datum, tijd, nu)) {
    return { ok: false, reden: "verleden" };
  }

  const binnenTijden = valtBinnenOpeningstijden(openingstijden, datum, tijd, duurMinuten);
  if (!binnenTijden.ok) {
    return { ok: false, reden: "buiten-openingstijden", bericht: binnenTijden.reden };
  }

  if (overlapt(tijdNaarMinuten(tijd), duurMinuten, bezet)) {
    return { ok: false, reden: "bezet" };
  }

  return { ok: true };
}

export type MailIntentie = "geannuleerd" | "verzet" | null;

type Afspraakgegevens = { status: BookingStatus; datum: string; tijd: string; service_id: string };

/** Welke mail hoort de klant te krijgen na deze wijziging, als er al een hoort? */
export function bepaalMailIntentie(
  huidig: Afspraakgegevens,
  nieuw: Afspraakgegevens,
): MailIntentie {
  if (nieuw.status === "geannuleerd") {
    return huidig.status !== "geannuleerd" ? "geannuleerd" : null;
  }

  const verzet =
    nieuw.datum !== huidig.datum ||
    normaliseerTijd(nieuw.tijd) !== normaliseerTijd(huidig.tijd) ||
    nieuw.service_id !== huidig.service_id;

  return verzet ? "verzet" : null;
}

export type KlantAnnuleringUitkomst = { ok: true } | { ok: false; error: string };

/** Mag de klant deze afspraak nog zelf annuleren? */
export function kanKlantAnnuleren(status: BookingStatus): KlantAnnuleringUitkomst {
  if (status === "geannuleerd") return { ok: false, error: "Deze afspraak is al geannuleerd." };
  if (status === "voltooid") {
    return {
      ok: false,
      error: "Deze afspraak is al geweest en kan niet meer geannuleerd worden.",
    };
  }
  return { ok: true };
}

/** Het geheime annuleertoken hoort niet in het beheerpaneel. */
export function zonderToken(record: BookingRecord): BookingWithService {
  const { annuleer_token: _token, ...rest } = record;
  return rest;
}

export function maakMailData(
  boeking: Pick<
    BookingRecord,
    "id" | "annuleer_token" | "klant_naam" | "klant_email" | "klant_telefoon" | "datum" | "tijd"
  >,
  dienst: Pick<BookedService, "naam" | "prijs" | "duur_minuten"> | null,
): BookingMailData {
  return {
    id: boeking.id,
    annuleer_token: boeking.annuleer_token,
    klant_naam: boeking.klant_naam,
    klant_email: boeking.klant_email,
    klant_telefoon: boeking.klant_telefoon,
    datum: boeking.datum,
    tijd: boeking.tijd,
    dienstNaam: dienst?.naam ?? "Behandeling",
    prijs: dienst?.prijs ?? null,
    duurMinuten: dienst?.duur_minuten ?? null,
  };
}

/** Hoe ver vooruit een klant kan boeken, en hoeveel dagen we er tegelijk tonen. */
export const BOEKBAAR_VENSTER_DAGEN = 21;
export const MAX_ZICHTBARE_DAGEN = 12;

/**
 * De eerstvolgende dagen waarop de zaak open is, als "YYYY-MM-DD". Vandaag telt
 * mee: de tijdsloten van vandaag filteren zelf al wat in het verleden ligt.
 */
export function bepaalBoekbareDagen(openingstijden: Openingstijden, vanaf: Date): string[] {
  const dagen: string[] = [];

  for (let i = 0; i < BOEKBAAR_VENSTER_DAGEN && dagen.length < MAX_ZICHTBARE_DAGEN; i++) {
    const dag = new Date(vanaf.getFullYear(), vanaf.getMonth(), vanaf.getDate() + i);
    const datum = formatDatum(dag);
    if (openingstijden[dagVanDatum(datum)]?.open) dagen.push(datum);
  }

  return dagen;
}

export type BoekingenSamenvatting = {
  bevestigd: number;
  voltooid: number;
  geannuleerd: number;
  /** De eerstvolgende bevestigde afspraken vanaf vandaag, op volgorde van de lijst. */
  aankomend: BookingWithService[];
};

/**
 * Cijfers voor het beheeroverzicht. Een afspraak van vandaag telt nog als
 * aankomend; alleen dagen vóór vandaag vallen af.
 */
export function samenvattingVanBoekingen(
  boekingen: BookingWithService[],
  vandaag: string,
  maxAankomend = 5,
): BoekingenSamenvatting {
  const telStatus = (status: BookingStatus) =>
    boekingen.filter((boeking) => boeking.status === status).length;

  return {
    bevestigd: telStatus("bevestigd"),
    voltooid: telStatus("voltooid"),
    geannuleerd: telStatus("geannuleerd"),
    aankomend: boekingen
      .filter((boeking) => boeking.status === "bevestigd" && boeking.datum >= vandaag)
      .slice(0, maxAankomend),
  };
}
