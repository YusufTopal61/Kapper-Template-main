import type { Weekday, OpeningHours } from "./settings.entity";

export const WEEKDAYS: Weekday[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

/** Dutch weekday names for user-facing copy; the keys stay English in code and database. */
export const WEEKDAY_LABELS: Record<Weekday, string> = {
  monday: "monday",
  tuesday: "tuesday",
  wednesday: "wednesday",
  thursday: "thursday",
  friday: "friday",
  saturday: "saturday",
  sunday: "sunday",
};

export const DEFAULT_OPENING_HOURS: OpeningHours = {
  monday: { open: false, from: "09:00", to: "18:00" },
  tuesday: { open: true, from: "09:00", to: "18:00" },
  wednesday: { open: true, from: "09:00", to: "18:00" },
  thursday: { open: true, from: "09:00", to: "18:00" },
  friday: { open: true, from: "09:00", to: "18:00" },
  saturday: { open: true, from: "09:00", to: "17:00" },
  sunday: { open: false, from: "09:00", to: "18:00" },
};

/** Minuten tussen twee opeenvolgende tijdsloten in de boekingsflow. */
export const SLOT_INTERVAL_MINUTES = 30;

/**
 * Bouwt een Date uit de losse onderdelen van "YYYY-MM-DD".
 * `new Date("2026-09-18")` wordt als UTC-middernacht geparsed en kan daardoor
 * een dag verspringen; deze variant blijft altijd op de bedoelde kalenderdag.
 */
export function parseDate(date: string): Date {
  const [year = 1970, month = 1, day = 1] = date.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function formatDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

export function weekdayOfDate(date: string): Weekday {
  // getDay(): 0 = zondag. DAGEN begint op maandag.
  const index = parseDate(date).getDay();
  return WEEKDAYS[(index + 6) % 7] ?? "monday";
}

export function timeToMinutes(time: string): number {
  const [hours = 0, minutes = 0] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  return `${String(hours).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
}

/** Normaliseert "9:00:00" of "09:00:00" naar "09:00". */
export function normalizeTime(time: string): string {
  const [hours = "0", minutes = "0"] = time.split(":");
  return `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}`;
}

/**
 * Controleert of een afspraak binnen de openingstijden valt. De behandeling
 * moet ook vóór sluitingstijd klaar zijn, dus de duur telt mee.
 */
export function isWithinOpeningHours(
  openingHours: OpeningHours,
  date: string,
  time: string,
  durationMinutes = 0,
): { ok: true } | { ok: false; reason: string } {
  const day = weekdayOfDate(date);
  const dayHours = openingHours[day] ?? DEFAULT_OPENING_HOURS[day];

  if (!dayHours?.open) {
    return {
      ok: false,
      reason: `We zijn op ${WEEKDAY_LABELS[day]} gesloten. Kies een andere dag.`,
    };
  }

  const start = timeToMinutes(normalizeTime(time));
  const open = timeToMinutes(normalizeTime(dayHours.from));
  const close = timeToMinutes(normalizeTime(dayHours.to));

  if (start < open || start + durationMinutes > close) {
    return {
      ok: false,
      reason: `Op ${WEEKDAY_LABELS[day]} kun je terecht tussen ${dayHours.from} en ${dayHours.to}.`,
    };
  }

  return { ok: true };
}

/** Alle tijdsloten waarop een behandeling van deze duur nog past. */
export function timeSlotsForDay(
  openingHours: OpeningHours,
  date: string,
  durationMinutes: number,
): string[] {
  const day = weekdayOfDate(date);
  const dayHours = openingHours[day] ?? DEFAULT_OPENING_HOURS[day];
  if (!dayHours?.open) return [];

  const open = timeToMinutes(normalizeTime(dayHours.from));
  const close = timeToMinutes(normalizeTime(dayHours.to));

  const slots: string[] = [];
  for (let m = open; m + durationMinutes <= close; m += SLOT_INTERVAL_MINUTES) {
    slots.push(minutesToTime(m));
  }
  return slots;
}

/**
 * Ligt dit moment in het verleden? Vergelijkt in de lokale tijd van de server.
 * `nu` is injecteerbaar, zodat de regel zonder klok te testen is.
 */
export function isInPast(date: string, time: string, now: Date = new Date()): boolean {
  const moment = parseDate(date);
  const [hours = 0, minutes = 0] = normalizeTime(time).split(":").map(Number);
  moment.setHours(hours, minutes, 0, 0);
  return moment.getTime() < now.getTime();
}
