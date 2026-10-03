import { createServerFn } from "@tanstack/react-start";
import { getClientIp } from "@/shared/lib/client-ip.server";
import { rateLimit } from "@/shared/lib/rate-limit";
import {
  adminBookingUpdateSchema,
  beschikbareSlotenSchema,
  bookingIdSchema,
  bookingInputSchema,
  cancelByTokenSchema,
} from "../domain/booking.schema";
import type { BoekingResultaat } from "../domain/booking.entity";
import { getBookingDeps } from "../container.server";
import * as bookings from "./booking.usecases";

const TIJDVENSTER_MS = 10 * 60 * 1000;

/** Rem op het raden van annuleertokens en het misbruiken van publieke acties. */
function teVaak(prefix: string, max: number) {
  const limiet = rateLimit(`${prefix}:${getClientIp()}`, { max, vensterMs: TIJDVENSTER_MS });
  return limiet.toegestaan ? null : limiet.opnieuwProberenOverSeconden;
}

const TE_VAAK_TOKEN = {
  ok: false as const,
  error: "Te veel pogingen. Probeer het straks opnieuw.",
};

// ------------------------------------------------------------ publiek

export const fetchAvailableSlots = createServerFn({ method: "POST" })
  .inputValidator(beschikbareSlotenSchema)
  .handler(({ data }) => bookings.getAvailableSlots(getBookingDeps(), data));

export const createBooking = createServerFn({ method: "POST" })
  .inputValidator(bookingInputSchema)
  .handler(async ({ data }): Promise<BoekingResultaat> => {
    const wacht = teVaak("boeking", 5);
    if (wacht !== null) {
      return {
        ok: false,
        error: `Te veel boekingspogingen. Probeer het over ${wacht} seconden opnieuw.`,
      };
    }
    return bookings.createBooking(getBookingDeps(), data);
  });

export const fetchBookingByToken = createServerFn({ method: "POST" })
  .inputValidator(cancelByTokenSchema)
  .handler(async ({ data }) => {
    if (teVaak("annuleer-lees", 20) !== null) return TE_VAAK_TOKEN;
    return bookings.getBookingByToken(getBookingDeps(), data);
  });

export const cancelBookingByToken = createServerFn({ method: "POST" })
  .inputValidator(cancelByTokenSchema)
  .handler(async ({ data }) => {
    if (teVaak("annuleer-actie", 20) !== null) return TE_VAAK_TOKEN;
    return bookings.cancelBookingByToken(getBookingDeps(), data);
  });

// ------------------------------------------------------------ beheer

export const fetchAdminBookings = createServerFn({ method: "GET" }).handler(() =>
  bookings.listAdminBookings(getBookingDeps()),
);

export const updateBooking = createServerFn({ method: "POST" })
  .inputValidator(adminBookingUpdateSchema)
  .handler(({ data }) => bookings.updateBookingAsAdmin(getBookingDeps(), data));

export const cancelBookingAdmin = createServerFn({ method: "POST" })
  .inputValidator(bookingIdSchema)
  .handler(({ data }) => bookings.cancelBookingAsAdmin(getBookingDeps(), data.id));
