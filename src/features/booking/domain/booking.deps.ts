import type { AdminGuard } from "@/modules/auth/domain/auth.gateway";
import type { ServiceRepository } from "@/modules/services/domain/service.repository";
import type { SettingsRepository } from "@/modules/settings/domain/settings.repository";
import type { BookingNotifier, IdGenerator } from "./booking.ports";
import type { BookingRepository } from "./booking.repository";

/** Alles wat de boekings-use-cases van buiten nodig hebben. De bedrading staat in app/di/container.ts. */
export type BookingDeps = {
  bookings: BookingRepository;
  services: Pick<ServiceRepository, "findById">;
  settings: Pick<SettingsRepository, "read">;
  notifier: BookingNotifier;
  ids: IdGenerator;
  assertAdmin: AdminGuard;
  /** Injecteerbaar zodat tijdsafhankelijke regels zonder klok te testen zijn. */
  now?: () => Date;
};
