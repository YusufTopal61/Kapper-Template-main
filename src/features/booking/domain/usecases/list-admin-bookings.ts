import type { BookingDeps } from "../booking.deps";
import type { BookingWithService } from "../booking.entity";

/** Admin: all bookings, without cancel tokens. */
export async function listAdminBookings(
  deps: Pick<BookingDeps, "bookings" | "assertAdmin">,
): Promise<BookingWithService[]> {
  await deps.assertAdmin();
  return deps.bookings.listAll();
}
