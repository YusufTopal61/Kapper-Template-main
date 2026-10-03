import type { BookingDeps } from "../booking.deps";
import { canCustomerCancel, buildMailData } from "../booking.rules";
import type { CancelByTokenInput } from "../booking.schema";
import { INVALID_LINK } from "./booking.messages";

/** Customer: cancel via the link in the mail. Cancelling a second time does nothing and sends no mail again. */
export async function cancelBookingByToken(
  deps: Pick<BookingDeps, "bookings" | "notifier">,
  input: CancelByTokenInput,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const record = await deps.bookings.findByToken(input.bookingId, input.token);
  if (!record) return { ok: false, error: INVALID_LINK };

  const permission = canCustomerCancel(record.status);
  if (!permission.ok) return permission;

  await deps.bookings.cancelByToken(record.id, input.token);
  await deps.notifier.bookingCancelled(buildMailData(record, record.services), "customer");

  return { ok: true };
}
