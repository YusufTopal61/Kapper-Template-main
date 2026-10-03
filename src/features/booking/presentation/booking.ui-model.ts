import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { normaliseerTijd, parseDatum } from "@/modules/settings/domain/opening-hours.rules";
import type { BookingStatus, BookingWithService } from "../domain/booking.entity";

export type StatusVariant = "default" | "secondary" | "destructive" | "outline";

export const statusLabel: Record<BookingStatus, string> = {
  bevestigd: "Bevestigd",
  voltooid: "Voltooid",
  geannuleerd: "Geannuleerd",
  no_show: "No-show",
};

export const statusVariant: Record<BookingStatus, StatusVariant> = {
  bevestigd: "default",
  voltooid: "secondary",
  geannuleerd: "destructive",
  no_show: "outline",
};

/** "dinsdag 8 september 2026" */
export const formatDatumLang = (datum: string) =>
  format(parseDatum(datum), "EEEE d MMMM yyyy", { locale: nl });

/** "8 sep 2026" */
export const formatDatumKort = (datum: string) =>
  format(parseDatum(datum), "d MMM yyyy", { locale: nl });

/** "8 sep" */
export const formatDatumKorter = (datum: string) =>
  format(parseDatum(datum), "d MMM", { locale: nl });

/** Een boeking zoals het beheerpaneel hem toont. Het annuleertoken zit er bewust niet in. */
export type BookingUIModel = {
  id: string;
  serviceId: string;
  klantNaam: string;
  klantTelefoon: string;
  dienstNaam: string;
  /** "YYYY-MM-DD" */
  datum: string;
  datumLabel: string;
  /** "HH:MM" */
  tijd: string;
  status: BookingStatus;
  statusLabel: string;
  statusVariant: StatusVariant;
  notities: string | null;
};

export function naarBookingUIModel(boeking: BookingWithService): BookingUIModel {
  return {
    id: boeking.id,
    serviceId: boeking.service_id,
    klantNaam: boeking.klant_naam,
    klantTelefoon: boeking.klant_telefoon,
    dienstNaam: boeking.services?.naam ?? "—",
    datum: boeking.datum,
    datumLabel: formatDatumKort(boeking.datum),
    tijd: normaliseerTijd(boeking.tijd),
    status: boeking.status,
    statusLabel: statusLabel[boeking.status],
    statusVariant: statusVariant[boeking.status],
    notities: boeking.notities,
  };
}
