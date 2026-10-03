import { normalizeTime } from "@/features/settings/domain/opening-hours.rules";
import { withDefaults } from "@/features/settings/domain/settings.rules";
import type { BookingDeps } from "../booking.deps";
import type { BookingWithService } from "../booking.entity";
import {
  getMailIntent,
  checkSchedule,
  buildMailData,
  toBusyRanges,
  DEFAULT_DURATION_MINUTES,
  withoutToken,
} from "../booking.rules";
import type { AdminBookingUpdate } from "../booking.schema";
import { SLOT_TAKEN_ADMIN } from "./booking.messages";

export type UpdateResult = { ok: true; booking: BookingWithService } | { ok: false; error: string };

/** Admin: change an appointment. Rescheduling or cancelling automatically mails the customer. */
export async function updateBookingAsAdmin(
  deps: BookingDeps,
  patch: AdminBookingUpdate,
): Promise<UpdateResult> {
  await deps.assertAdmin();
  const { id, ...fields } = patch;

  const current = await deps.bookings.findForAdmin(id);
  if (!current) return { ok: false, error: "Deze boeking bestaat niet meer." };

  const next = {
    status: fields.status ?? current.status,
    date: fields.date ?? current.date,
    time: normalizeTime(fields.time ?? current.time),
    serviceId: fields.serviceId ?? current.serviceId,
  };

  const service = await deps.services.findById(next.serviceId);

  // Only check while the appointment stays active; a cancelled
  // appointment no longer needs to fit the schedule.
  if (next.status !== "cancelled") {
    const { openingHours } = withDefaults(await deps.settings.read());
    const busy = toBusyRanges(await deps.bookings.listBusy(next.date), id);

    const schedule = checkSchedule({
      openingHours,
      date: next.date,
      time: next.time,
      durationMinutes: service?.durationMinutes ?? DEFAULT_DURATION_MINUTES,
      busy,
      ignorePast: true,
    });

    if (!schedule.ok) {
      return {
        ok: false,
        error: schedule.reason === "outside-opening-hours" ? schedule.message : SLOT_TAKEN_ADMIN,
      };
    }
  }

  const saveResult = await deps.bookings.updateAsAdmin(id, {
    ...fields,
    ...(fields.time ? { time: next.time } : {}),
  });
  if (!saveResult.ok) return { ok: false, error: SLOT_TAKEN_ADMIN };

  const updated = saveResult.booking;
  const intent = getMailIntent(current, next);

  if (intent) {
    const mail = buildMailData(updated, service);
    if (intent === "cancelled") {
      await deps.notifier.bookingCancelled(mail, "admin");
    } else {
      await deps.notifier.bookingRescheduled(mail);
    }
  }

  return { ok: true, booking: withoutToken(updated) };
}
