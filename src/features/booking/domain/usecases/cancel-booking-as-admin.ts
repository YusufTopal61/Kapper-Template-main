import type { BookingDeps } from "../booking.deps";
import { updateBookingAsAdmin } from "./update-booking-as-admin";

/** Cancelling is a change of status: this keeps the cancellation mails in one place. */
export function cancelBookingAsAdmin(deps: BookingDeps, id: string) {
  return updateBookingAsAdmin(deps, { id, status: "cancelled" });
}
