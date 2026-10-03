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

/** Minutes between two consecutive time slots in the booking flow. */
export const SLOT_INTERVAL_MINUTES = 30;

/**
 * Builds a Date from the separate parts of "YYYY-MM-DD".
 * `new Date("2026-09-18")` is parsed as UTC midnight and can therefore shift by
 * a day; this variant always stays on the intended calendar day.
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
  // getDay(): 0 = Sunday. WEEKDAYS starts on Monday.
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

/** Normalizes "9:00:00" or "09:00:00" to "09:00". */
export function normalizeTime(time: string): string {
  const [hours = "0", minutes = "0"] = time.split(":");
  return `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}`;
}

/**
 * Checks whether an appointment falls within the opening hours. The treatment
 * must also finish before closing time, so the duration counts.
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

/** All time slots at which a treatment of this duration still fits. */
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
 * Is this moment in the past? Compares in the server's local time.
 * `now` is injectable, so the rule can be tested without a clock.
 */
export function isInPast(date: string, time: string, now: Date = new Date()): boolean {
  const moment = parseDate(date);
  const [hours = 0, minutes = 0] = normalizeTime(time).split(":").map(Number);
  moment.setHours(hours, minutes, 0, 0);
  return moment.getTime() < now.getTime();
}
