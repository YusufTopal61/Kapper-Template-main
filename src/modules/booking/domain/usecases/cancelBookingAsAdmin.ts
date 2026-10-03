import type { BookingDeps } from "../booking.deps";
import { updateBookingAsAdmin } from "./updateBookingAsAdmin";

/** Annuleren is een wijziging van de status: zo staan de annuleringsmails op één plek. */
export function cancelBookingAsAdmin(deps: BookingDeps, id: string) {
  return updateBookingAsAdmin(deps, { id, status: "geannuleerd" });
}
