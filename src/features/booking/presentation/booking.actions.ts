"use server";

import { getBookingDeps } from "@/app/di/container";
import { ongeldigeInvoer } from "@/shared/lib/action-result";
import { beperkAanvragen } from "@/shared/lib/request-limit.server";
import { uitvoerenAlsBeheerder } from "@/modules/auth/presentation/admin-action";
import type { BoekingResultaat } from "../domain/booking.entity";
import {
  adminBookingUpdateSchema,
  beschikbareSlotenSchema,
  bookingIdSchema,
  bookingInputSchema,
  cancelByTokenSchema,
} from "../domain/booking.schema";
import { cancelBookingAsAdmin } from "../domain/usecases/cancelBookingAsAdmin";
import { cancelBookingByToken } from "../domain/usecases/cancelBookingByToken";
import { createBooking } from "../domain/usecases/createBooking";
import { getAvailableSlots } from "../domain/usecases/getAvailableSlots";
import { updateBookingAsAdmin } from "../domain/usecases/updateBookingAsAdmin";

const TE_VAAK = { ok: false as const, error: "Te veel pogingen. Probeer het straks opnieuw." };

// ------------------------------------------------------------ publiek

export async function fetchAvailableSlots(input: unknown) {
  const geldig = beschikbareSlotenSchema.safeParse(input);
  if (!geldig.success) return { sloten: [], gesloten: true };

  return getAvailableSlots(getBookingDeps(), geldig.data);
}

export async function createBookingAction(input: unknown): Promise<BoekingResultaat> {
  const geldig = bookingInputSchema.safeParse(input);
  if (!geldig.success) return ongeldigeInvoer(geldig.error);

  const wacht = await beperkAanvragen("boeking", 5);
  if (wacht !== null) {
    return {
      ok: false,
      error: `Te veel boekingspogingen. Probeer het over ${wacht} seconden opnieuw.`,
    };
  }

  return createBooking(getBookingDeps(), geldig.data);
}

export async function cancelBookingByTokenAction(input: unknown) {
  const geldig = cancelByTokenSchema.safeParse(input);
  if (!geldig.success) return ongeldigeInvoer(geldig.error);

  if ((await beperkAanvragen("annuleer-actie", 20)) !== null) return TE_VAAK;

  return cancelBookingByToken(getBookingDeps(), geldig.data);
}

// ------------------------------------------------------------ beheer

export async function updateBookingAction(input: unknown) {
  const geldig = adminBookingUpdateSchema.safeParse(input);
  if (!geldig.success) return ongeldigeInvoer(geldig.error);

  return uitvoerenAlsBeheerder(() => updateBookingAsAdmin(getBookingDeps(), geldig.data));
}

export async function cancelBookingAdminAction(input: unknown) {
  const geldig = bookingIdSchema.safeParse(input);
  if (!geldig.success) return ongeldigeInvoer(geldig.error);

  return uitvoerenAlsBeheerder(() => cancelBookingAsAdmin(getBookingDeps(), geldig.data.id));
}
