"use server";

import { getBookingDeps } from "@/lib/di/container";
import { invalidInput } from "@/lib/utils/action-result";
import { limitRequests } from "@/lib/utils/request-limit.server";
import { runAsAdmin } from "@/features/auth/presentation/admin-action";
import type { BookingResult } from "../domain/booking.entity";
import {
  adminBookingUpdateSchema,
  availableSlotsSchema,
  bookingIdSchema,
  bookingInputSchema,
  cancelByTokenSchema,
} from "../domain/booking.schema";
import { cancelBookingAsAdmin } from "../domain/usecases/cancel-booking-as-admin";
import { cancelBookingByToken } from "../domain/usecases/cancel-booking-by-token";
import { createBooking } from "../domain/usecases/create-booking";
import { getAvailableSlots } from "../domain/usecases/get-available-slots";
import { updateBookingAsAdmin } from "../domain/usecases/update-booking-as-admin";

const TOO_MANY_REQUESTS = {
  ok: false as const,
  error: "Te veel pogingen. Probeer het straks opnieuw.",
};

// ------------------------------------------------------------ publiek

export async function fetchAvailableSlots(input: unknown) {
  const valid = availableSlotsSchema.safeParse(input);
  if (!valid.success) return { slots: [], closed: true };

  return getAvailableSlots(getBookingDeps(), valid.data);
}

export async function createBookingAction(input: unknown): Promise<BookingResult> {
  const valid = bookingInputSchema.safeParse(input);
  if (!valid.success) return invalidInput(valid.error);

  const waitSeconds = await limitRequests("booking", 5);
  if (waitSeconds !== null) {
    return {
      ok: false,
      error: `Te veel boekingspogingen. Probeer het over ${waitSeconds} seconden opnieuw.`,
    };
  }

  return createBooking(getBookingDeps(), valid.data);
}

export async function cancelBookingByTokenAction(input: unknown) {
  const valid = cancelByTokenSchema.safeParse(input);
  if (!valid.success) return invalidInput(valid.error);

  if ((await limitRequests("cancel-action", 20)) !== null) return TOO_MANY_REQUESTS;

  return cancelBookingByToken(getBookingDeps(), valid.data);
}

// ------------------------------------------------------------ beheer

export async function updateBookingAction(input: unknown) {
  const valid = adminBookingUpdateSchema.safeParse(input);
  if (!valid.success) return invalidInput(valid.error);

  return runAsAdmin(() => updateBookingAsAdmin(getBookingDeps(), valid.data));
}

export async function cancelBookingAdminAction(input: unknown) {
  const valid = bookingIdSchema.safeParse(input);
  if (!valid.success) return invalidInput(valid.error);

  return runAsAdmin(() => cancelBookingAsAdmin(getBookingDeps(), valid.data.id));
}
