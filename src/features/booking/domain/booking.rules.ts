import {
  weekdayOfDate,
  formatDate,
  isInPast,
  normalizeTime,
  timeToMinutes,
  timeSlotsForDay,
  isWithinOpeningHours,
} from "@/features/settings/domain/opening-hours.rules";
import type { OpeningHours } from "@/features/settings/domain/settings.entity";
import type {
  BookedService,
  BookingMailData,
  BookingRecord,
  BookingStatus,
  BookingWithService,
  BusyBooking,
  BusyRange,
  TimeSlot,
} from "./booking.entity";

/** Statussen die een tijdslot bezet houden. Een geannuleerde afspraak telt niet mee. */
export const ACTIVE_STATUSES = ["confirmed", "completed", "no_show"] as const;

/** Duur waarmee we rekenen als de gekoppelde dienst ontbreekt. */
export const DEFAULT_DURATION_MINUTES = 30;

/**
 * Met `negeerId` sluit je de afspraak uit die je zelf aan het verplaatsen
 * bent — die zou anders met zichzelf botsen.
 */
export function toBusyRanges(busy: BusyBooking[], ignoreId?: string): BusyRange[] {
  return busy
    .filter((appointment) => appointment.id !== ignoreId)
    .map((appointment) => {
      const start = timeToMinutes(normalizeTime(appointment.time));
      return { start, end: start + (appointment.durationMinutes ?? DEFAULT_DURATION_MINUTES) };
    });
}

/** Botst een behandeling van `duur` minuten vanaf `start` met iets bestaands? */
export function overlaps(start: number, duration: number, ranges: BusyRange[]): boolean {
  const end = start + duration;
  return ranges.some((range) => start < range.end && end > range.start);
}

/** Tijdsloten voor een dag, met per slot of de behandeling er nog in past. */
export function getTimeSlots(input: {
  openingHours: OpeningHours;
  date: string;
  durationMinutes: number;
  busy: BusyRange[];
  now?: Date;
}): { slots: TimeSlot[]; closed: boolean } {
  const { openingHours, date, durationMinutes, busy, now } = input;

  const candidates = timeSlotsForDay(openingHours, date, durationMinutes);
  if (candidates.length === 0) return { slots: [], closed: true };

  const slots = candidates.map((time) => ({
    time,
    available: !isInPast(date, time, now) && !overlaps(timeToMinutes(time), durationMinutes, busy),
  }));

  return { slots, closed: false };
}

export type ScheduleCheckResult =
  | { ok: true }
  | { ok: false; reason: "past" }
  | { ok: false; reason: "outside-opening-hours"; message: string }
  | { ok: false; reason: "busy" };

/**
 * Past deze afspraak in het rooster? De volgorde is bewust: eerst het verleden,
 * dan de openingstijden, dan pas of iemand anders het tijdslot al heeft.
 * De beheerder mag een afspraak in het verleden bewerken (`negeerVerleden`).
 */
export function checkSchedule(input: {
  openingHours: OpeningHours;
  date: string;
  time: string;
  durationMinutes: number;
  busy: BusyRange[];
  ignorePast?: boolean;
  now?: Date;
}): ScheduleCheckResult {
  const { openingHours, date, durationMinutes, busy, ignorePast, now } = input;
  const time = normalizeTime(input.time);

  if (!ignorePast && isInPast(date, time, now)) {
    return { ok: false, reason: "past" };
  }

  const withinHours = isWithinOpeningHours(openingHours, date, time, durationMinutes);
  if (!withinHours.ok) {
    return { ok: false, reason: "outside-opening-hours", message: withinHours.reason };
  }

  if (overlaps(timeToMinutes(time), durationMinutes, busy)) {
    return { ok: false, reason: "busy" };
  }

  return { ok: true };
}

export type MailIntent = "cancelled" | "rescheduled" | null;

type AppointmentData = { status: BookingStatus; date: string; time: string; serviceId: string };

/** Welke mail hoort de klant te krijgen na deze wijziging, als er al een hoort? */
export function getMailIntent(current: AppointmentData, newBooking: AppointmentData): MailIntent {
  if (newBooking.status === "cancelled") {
    return current.status !== "cancelled" ? "cancelled" : null;
  }

  const rescheduled =
    newBooking.date !== current.date ||
    normalizeTime(newBooking.time) !== normalizeTime(current.time) ||
    newBooking.serviceId !== current.serviceId;

  return rescheduled ? "rescheduled" : null;
}

export type CustomerCancellationResult = { ok: true } | { ok: false; error: string };

/** Mag de klant deze afspraak nog zelf annuleren? */
export function canCustomerCancel(status: BookingStatus): CustomerCancellationResult {
  if (status === "cancelled") return { ok: false, error: "Deze afspraak is al geannuleerd." };
  if (status === "completed") {
    return {
      ok: false,
      error: "Deze afspraak is al geweest en kan niet meer geannuleerd worden.",
    };
  }
  return { ok: true };
}

/** Het geheime annuleertoken hoort niet in het beheerpaneel. */
export function withoutToken(record: BookingRecord): BookingWithService {
  const { cancelToken: _token, ...rest } = record;
  return rest;
}

export function buildMailData(
  booking: Pick<
    BookingRecord,
    "id" | "cancelToken" | "customerName" | "customerEmail" | "customerPhone" | "date" | "time"
  >,
  service: Pick<BookedService, "name" | "price" | "durationMinutes"> | null,
): BookingMailData {
  return {
    id: booking.id,
    cancelToken: booking.cancelToken,
    customerName: booking.customerName,
    customerEmail: booking.customerEmail,
    customerPhone: booking.customerPhone,
    date: booking.date,
    time: booking.time,
    serviceName: service?.name ?? "Behandeling",
    price: service?.price ?? null,
    durationMinutes: service?.durationMinutes ?? null,
  };
}

/** Hoe ver vooruit een klant kan boeken, en hoeveel dagen we er tegelijk tonen. */
export const BOOKABLE_WINDOW_DAYS = 21;
export const MAX_VISIBLE_DAYS = 12;

/**
 * De eerstvolgende dagen waarop de zaak open is, als "YYYY-MM-DD". Vandaag telt
 * mee: de tijdsloten van vandaag filteren zelf al wat in het verleden ligt.
 */
export function getBookableDays(openingHours: OpeningHours, since: Date): string[] {
  const days: string[] = [];

  for (let i = 0; i < BOOKABLE_WINDOW_DAYS && days.length < MAX_VISIBLE_DAYS; i++) {
    const day = new Date(since.getFullYear(), since.getMonth(), since.getDate() + i);
    const date = formatDate(day);
    if (openingHours[weekdayOfDate(date)]?.open) days.push(date);
  }

  return days;
}

export type BookingsSummary = {
  confirmed: number;
  completed: number;
  cancelled: number;
  /** De eerstvolgende bevestigde afspraken vanaf vandaag, op volgorde van de lijst. */
  upcoming: BookingWithService[];
};

/**
 * Cijfers voor het beheeroverzicht. Een afspraak van vandaag telt nog als
 * aankomend; alleen dagen vóór vandaag vallen af.
 */
export function summarizeBookings(
  bookings: BookingWithService[],
  today: string,
  maxUpcoming = 5,
): BookingsSummary {
  const countStatus = (status: BookingStatus) =>
    bookings.filter((booking) => booking.status === status).length;

  return {
    confirmed: countStatus("confirmed"),
    completed: countStatus("completed"),
    cancelled: countStatus("cancelled"),
    upcoming: bookings
      .filter((booking) => booking.status === "confirmed" && booking.date >= today)
      .slice(0, maxUpcoming),
  };
}
