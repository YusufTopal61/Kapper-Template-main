import type { BookingDeps } from "../booking.deps";
import type { BookingWithService } from "../booking.entity";

/** Beheer: alle boekingen, zonder annuleertokens. */
export async function listAdminBookings(
  deps: Pick<BookingDeps, "bookings" | "assertAdmin">,
): Promise<BookingWithService[]> {
  await deps.assertAdmin();
  return deps.bookings.listAll();
}
