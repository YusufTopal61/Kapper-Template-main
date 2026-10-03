import { getAdminGuard } from "@/modules/auth/container.server";
import { createSupabaseServiceRepository } from "@/modules/services/data/service.repository.server";
import { createSupabaseSettingsRepository } from "@/modules/settings/data/settings.repository.server";
import { maakId, maakToken } from "@/shared/lib/random";
import { createResendBookingNotifier } from "./data/booking.notifier.server";
import { createSupabaseBookingRepository } from "./data/booking.repository.server";
import type { BookingDeps } from "./business/booking.usecases";

/**
 * Composition root van de booking-module. Hier — en alleen hier — worden de
 * concrete implementaties (Supabase, Resend) aan de use cases gehangen.
 */
export function getBookingDeps(): BookingDeps {
  const settings = createSupabaseSettingsRepository();

  return {
    bookings: createSupabaseBookingRepository(),
    services: createSupabaseServiceRepository(),
    settings,
    notifier: createResendBookingNotifier({ settings }),
    ids: { newId: maakId, newToken: maakToken },
    assertAdmin: getAdminGuard(),
  };
}
