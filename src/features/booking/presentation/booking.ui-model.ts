import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { normalizeTime, parseDate } from "@/features/settings/domain/opening-hours.rules";
import type { BookingStatus, BookingWithService } from "../domain/booking.entity";

export type StatusVariant = "default" | "secondary" | "destructive" | "outline";

export const statusLabel: Record<BookingStatus, string> = {
  confirmed: "Bevestigd",
  completed: "Voltooid",
  cancelled: "Geannuleerd",
  no_show: "No-show",
};

export const statusVariant: Record<BookingStatus, StatusVariant> = {
  confirmed: "default",
  completed: "secondary",
  cancelled: "destructive",
  no_show: "outline",
};

/** "dinsdag 8 september 2026" */
export const formatDateLong = (date: string) =>
  format(parseDate(date), "EEEE d MMMM yyyy", { locale: nl });

/** "8 sep 2026" */
export const formatDateShort = (date: string) =>
  format(parseDate(date), "d MMM yyyy", { locale: nl });

/** "8 sep" */
export const formatDateShorter = (date: string) => format(parseDate(date), "d MMM", { locale: nl });

/** Een boeking zoals het beheerpaneel hem toont. Het annuleertoken zit er bewust niet in. */
export type BookingUIModel = {
  id: string;
  serviceId: string;
  customerName: string;
  customerPhone: string;
  serviceName: string;
  /** "YYYY-MM-DD" */
  date: string;
  dateLabel: string;
  /** "HH:MM" */
  time: string;
  status: BookingStatus;
  statusLabel: string;
  statusVariant: StatusVariant;
  notes: string | null;
};

export function toBookingUIModel(booking: BookingWithService): BookingUIModel {
  return {
    id: booking.id,
    serviceId: booking.serviceId,
    customerName: booking.customerName,
    customerPhone: booking.customerPhone,
    serviceName: booking.services?.name ?? "—",
    date: booking.date,
    dateLabel: formatDateShort(booking.date),
    time: normalizeTime(booking.time),
    status: booking.status,
    statusLabel: statusLabel[booking.status],
    statusVariant: statusVariant[booking.status],
    notes: booking.notes,
  };
}
