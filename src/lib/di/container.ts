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
 * Composition root: the only file that couples interfaces from domain/ to their
 * implementations in data/. To replace Supabase or Resend, only this file and
 * the relevant data/ folder change.
 *
 * Everything here is rebuilt per request: the Supabase clients read the session
 * from the current request's cookies and must not be shared.
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
