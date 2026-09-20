import type { Dag, Openingstijden } from "./supabase/types";

export const DAGEN: Dag[] = [
  "maandag",
  "dinsdag",
  "woensdag",
  "donderdag",
  "vrijdag",
  "zaterdag",
  "zondag",
];

export const DEFAULT_OPENINGSTIJDEN: Openingstijden = {
  maandag: { open: false, van: "09:00", tot: "18:00" },
  dinsdag: { open: true, van: "09:00", tot: "18:00" },
  woensdag: { open: true, van: "09:00", tot: "18:00" },
  donderdag: { open: true, van: "09:00", tot: "18:00" },
  vrijdag: { open: true, van: "09:00", tot: "18:00" },
  zaterdag: { open: true, van: "09:00", tot: "17:00" },
  zondag: { open: false, van: "09:00", tot: "18:00" },
};

/** Minuten tussen twee opeenvolgende tijdsloten in de boekingsflow. */
export const SLOT_INTERVAL_MINUTEN = 30;

/**
 * Bouwt een Date uit de losse onderdelen van "YYYY-MM-DD".
 * `new Date("2026-09-18")` wordt als UTC-middernacht geparsed en kan daardoor
 * een dag verspringen; deze variant blijft altijd op de bedoelde kalenderdag.
 */
export function parseDatum(datum: string): Date {
  const [jaar = 1970, maand = 1, dag = 1] = datum.split("-").map(Number);
  return new Date(jaar, maand - 1, dag);
}

export function formatDatum(date: Date): string {
  const maand = String(date.getMonth() + 1).padStart(2, "0");
  const dag = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${maand}-${dag}`;
}

export function dagVanDatum(datum: string): Dag {
  // getDay(): 0 = zondag. DAGEN begint op maandag.
  const index = parseDatum(datum).getDay();
  return DAGEN[(index + 6) % 7] ?? "maandag";
}

export function tijdNaarMinuten(tijd: string): number {
  const [uren = 0, minuten = 0] = tijd.split(":").map(Number);
  return uren * 60 + minuten;
}

export function minutenNaarTijd(minuten: number): string {
  const uren = Math.floor(minuten / 60);
  return `${String(uren).padStart(2, "0")}:${String(minuten % 60).padStart(2, "0")}`;
}

/** Normaliseert "9:00:00" of "09:00:00" naar "09:00". */
export function normaliseerTijd(tijd: string): string {
  const [uren = "0", minuten = "0"] = tijd.split(":");
  return `${uren.padStart(2, "0")}:${minuten.padStart(2, "0")}`;
}

/**
 * Controleert of een afspraak binnen de openingstijden valt. De behandeling
 * moet ook vóór sluitingstijd klaar zijn, dus de duur telt mee.
 */
export function valtBinnenOpeningstijden(
  openingstijden: Openingstijden,
  datum: string,
  tijd: string,
  duurMinuten = 0,
): { ok: true } | { ok: false; reden: string } {
  const dag = dagVanDatum(datum);
  const dagtijden = openingstijden[dag] ?? DEFAULT_OPENINGSTIJDEN[dag];

  if (!dagtijden?.open) {
    return { ok: false, reden: `We zijn op ${dag} gesloten. Kies een andere dag.` };
  }

  const start = tijdNaarMinuten(normaliseerTijd(tijd));
  const open = tijdNaarMinuten(normaliseerTijd(dagtijden.van));
  const sluit = tijdNaarMinuten(normaliseerTijd(dagtijden.tot));

  if (start < open || start + duurMinuten > sluit) {
    return {
      ok: false,
      reden: `Op ${dag} kun je terecht tussen ${dagtijden.van} en ${dagtijden.tot}.`,
    };
  }

  return { ok: true };
}

/** Alle tijdsloten waarop een behandeling van deze duur nog past. */
export function tijdslotenVoorDag(
  openingstijden: Openingstijden,
  datum: string,
  duurMinuten: number,
): string[] {
  const dag = dagVanDatum(datum);
  const dagtijden = openingstijden[dag] ?? DEFAULT_OPENINGSTIJDEN[dag];
  if (!dagtijden?.open) return [];

  const open = tijdNaarMinuten(normaliseerTijd(dagtijden.van));
  const sluit = tijdNaarMinuten(normaliseerTijd(dagtijden.tot));

  const sloten: string[] = [];
  for (let m = open; m + duurMinuten <= sluit; m += SLOT_INTERVAL_MINUTEN) {
    sloten.push(minutenNaarTijd(m));
  }
  return sloten;
}

/** Ligt dit moment in het verleden? Vergelijkt in de lokale tijd van de server. */
export function ligtInVerleden(datum: string, tijd: string): boolean {
  const moment = parseDatum(datum);
  const [uren = 0, minuten = 0] = normaliseerTijd(tijd).split(":").map(Number);
  moment.setHours(uren, minuten, 0, 0);
  return moment.getTime() < Date.now();
}
