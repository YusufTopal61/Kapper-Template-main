import type { AdminGuard } from "@/features/auth/domain/auth.gateway";
import type { ServiceRepository } from "@/features/services/domain/service.repository";
import type { SettingsRepository } from "@/features/settings/domain/settings.repository";
import type { BookingNotifier, IdGenerator } from "./booking.ports";
import type { BookingRepository } from "./booking.repository";

/** Everything the booking use cases need from outside. The wiring lives in lib/di/container.ts. */
export type BookingDeps = {
  bookings: BookingRepository;
  services: Pick<ServiceRepository, "findById">;
  settings: Pick<SettingsRepository, "read">;
  notifier: BookingNotifier;
  ids: IdGenerator;
  assertAdmin: AdminGuard;
  /** Injectable so time-dependent rules can be tested without a clock. */
  now?: () => Date;
};
