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

/** Statuses that keep a time slot busy. A cancelled appointment does not count. */
export const ACTIVE_STATUSES = ["confirmed", "completed", "no_show"] as const;

/** Duration we calculate with when the linked service is missing. */
export const DEFAULT_DURATION_MINUTES = 30;

/**
 * With `ignoreId` you exclude the appointment you are moving yourself —
 * it would otherwise collide with itself.
 */
export function toBusyRanges(busy: BusyBooking[], ignoreId?: string): BusyRange[] {
  return busy
    .filter((appointment) => appointment.id !== ignoreId)
    .map((appointment) => {
      const start = timeToMinutes(normalizeTime(appointment.time));
      return { start, end: start + (appointment.durationMinutes ?? DEFAULT_DURATION_MINUTES) };
    });
}

/** Does a treatment of `duration` minutes from `start` collide with anything existing? */
export function overlaps(start: number, duration: number, ranges: BusyRange[]): boolean {
  const end = start + duration;
  return ranges.some((range) => start < range.end && end > range.start);
}

/** Time slots for a day, with per slot whether the treatment still fits. */
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
 * Does this appointment fit the schedule? The order is deliberate: first the past,
 * then the opening hours, only then whether someone else already has the slot.
 * The admin may edit an appointment in the past (`ignorePast`).
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

/** Which mail should the customer get after this change, if any? */
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

/** May the customer still cancel this appointment themselves? */
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

/** The secret cancel token does not belong in the admin panel. */
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

/** How far ahead a customer can book, and how many days we show at once. */
export const BOOKABLE_WINDOW_DAYS = 21;
export const MAX_VISIBLE_DAYS = 12;

/**
 * The next days on which the business is open, as "YYYY-MM-DD". Today counts:
 * the time slots of today already filter out what lies in the past.
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
  /** The next confirmed appointments from today, in list order. */
  upcoming: BookingWithService[];
};

/**
 * Numbers for the admin overview. An appointment today still counts as
 * upcoming; only days before today drop out.
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
