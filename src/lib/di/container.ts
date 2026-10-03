import "server-only";
import { createSupabaseAuthGateway } from "@/features/auth/data/auth.supabase";
import { createAdminGuard } from "@/features/auth/domain/usecases/create-admin-guard";
import { createResendBookingNotifier } from "@/features/booking/data/booking.resend";
import { createSupabaseBookingRepository } from "@/features/booking/data/booking.supabase";
import type { BookingDeps } from "@/features/booking/domain/booking.deps";
import { createSupabaseServiceRepository } from "@/features/services/data/service.supabase";
import { createResendEmailStatusChecker } from "@/features/settings/data/email-status.resend";
import { createSupabaseSettingsRepository } from "@/features/settings/data/settings.supabase";
import { nowInAmsterdam } from "@/lib/utils/clock";
import { generateId, generateToken } from "@/lib/utils/random";

/**
 * Composition root: het enige bestand dat interfaces uit domain/ aan hun
 * implementaties in data/ koppelt. Wil je Supabase of Resend vervangen, dan
 * verandert alleen dit bestand en de betreffende data/-map.
 *
 * Alles hier wordt per request opnieuw opgebouwd: de Supabase-clients lezen de
 * sessie uit de cookies van het huidige request en mogen niet gedeeld worden.
 */

export function getAuthGateway() {
  return createSupabaseAuthGateway();
}

export function getAdminGuard() {
  return createAdminGuard(createSupabaseAuthGateway());
}

export function getServiceDeps() {
  return {
    repo: createSupabaseServiceRepository(),
    assertAdmin: getAdminGuard(),
  };
}

export function getSettingsDeps() {
  return {
    repo: createSupabaseSettingsRepository(),
    checker: createResendEmailStatusChecker(),
    assertAdmin: getAdminGuard(),
  };
}

export function getBookingDeps(): BookingDeps {
  const settings = createSupabaseSettingsRepository();

  return {
    bookings: createSupabaseBookingRepository(),
    services: createSupabaseServiceRepository(),
    settings,
    notifier: createResendBookingNotifier({ settings }),
    ids: { newId: generateId, newToken: generateToken },
    assertAdmin: getAdminGuard(),
    now: nowInAmsterdam,
  };
}
