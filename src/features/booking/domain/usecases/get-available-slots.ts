import { withDefaults } from "@/features/settings/domain/settings.rules";
import type { BookingDeps } from "../booking.deps";
import type { TimeSlot } from "../booking.entity";
import { getTimeSlots, toBusyRanges } from "../booking.rules";
import type { AvailableSlotsInput } from "../booking.schema";

/** Public: which time slots are still free that day for this service? */
export async function getAvailableSlots(
  deps: Pick<BookingDeps, "bookings" | "services" | "settings" | "now">,
  input: AvailableSlotsInput,
): Promise<{ slots: TimeSlot[]; closed: boolean }> {
  const service = await deps.services.findById(input.serviceId);
  if (!service || !service.isActive) return { slots: [], closed: true };

  const { openingHours } = withDefaults(await deps.settings.read());
  const busy = toBusyRanges(await deps.bookings.listBusy(input.date));

  return getTimeSlots({
    openingHours,
    date: input.date,
    durationMinutes: service.durationMinutes,
    busy,
    ...(deps.now ? { now: deps.now() } : {}),
  });
}
