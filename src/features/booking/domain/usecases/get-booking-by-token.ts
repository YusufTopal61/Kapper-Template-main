import { normalizeTime } from "@/features/settings/domain/opening-hours.rules";
import { withDefaults } from "@/features/settings/domain/settings.rules";
import type { BookingDeps } from "../booking.deps";
import type { BookingByToken } from "../booking.entity";
import type { CancelByTokenInput } from "../booking.schema";
import { INVALID_LINK } from "./booking.messages";

/** Customer: what is scheduled for this cancel link? No valid token, no data. */
export async function getBookingByToken(
  deps: Pick<BookingDeps, "bookings" | "settings">,
  input: CancelByTokenInput,
): Promise<{ ok: true; booking: BookingByToken } | { ok: false; error: string }> {
  const record = await deps.bookings.findByToken(input.bookingId, input.token);
  if (!record) return { ok: false, error: INVALID_LINK };

  const settings = withDefaults(await deps.settings.read());

  return {
    ok: true,
    booking: {
      id: record.id,
      customerName: record.customerName,
      date: record.date,
      time: normalizeTime(record.time),
      status: record.status,
      serviceName: record.services?.name ?? "Behandeling",
      price: record.services?.price ?? null,
      durationMinutes: record.services?.durationMinutes ?? null,
      businessName: settings.businessName,
      address: settings.address,
    },
  };
}
