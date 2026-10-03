import "server-only";
import { createSupabaseAuthGateway } from "@/modules/auth/data/auth.supabase";
import { createAdminGuard } from "@/modules/auth/domain/usecases/createAdminGuard";
import { createResendBookingNotifier } from "@/modules/booking/data/booking.resend";
import { createSupabaseBookingRepository } from "@/modules/booking/data/booking.supabase";
import type { BookingDeps } from "@/modules/booking/domain/booking.deps";
import { createSupabaseServiceRepository } from "@/modules/services/data/service.supabase";
import { createResendEmailStatusChecker } from "@/modules/settings/data/email-status.resend";
import { createSupabaseSettingsRepository } from "@/modules/settings/data/settings.supabase";
import { nuInAmsterdam } from "@/shared/lib/clock";
import { maakId, maakToken } from "@/shared/lib/random";

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
    ids: { newId: maakId, newToken: maakToken },
    assertAdmin: getAdminGuard(),
    now: nuInAmsterdam,
  };
}
