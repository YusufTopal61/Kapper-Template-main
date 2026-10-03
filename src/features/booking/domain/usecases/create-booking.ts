import { normalizeTime } from "@/features/settings/domain/opening-hours.rules";
import { withDefaults } from "@/features/settings/domain/settings.rules";
import type { BookingDeps } from "../booking.deps";
import type { BookingResult } from "../booking.entity";
import { checkSchedule, buildMailData, toBusyRanges } from "../booking.rules";
import type { BookingInput } from "../booking.schema";
import { SLOT_TAKEN_PUBLIC } from "./booking.messages";

/** Publiek: een afspraak maken. De bevestigingsmail is een bijzaak; de afspraak staat dan al. */
export async function createBooking(
  deps: Omit<BookingDeps, "assertAdmin">,
  input: BookingInput,
): Promise<BookingResult> {
  const service = await deps.services.findById(input.serviceId);
  if (!service || !service.isActive) {
    return { ok: false, error: "Deze dienst is niet meer beschikbaar.", field: "serviceId" };
  }

  const time = normalizeTime(input.time);
  const { openingHours } = withDefaults(await deps.settings.read());
  const busy = toBusyRanges(await deps.bookings.listBusy(input.date));

  const schedule = checkSchedule({
    openingHours,
    date: input.date,
    time,
    durationMinutes: service.durationMinutes,
    busy,
    ...(deps.now ? { now: deps.now() } : {}),
  });

  if (!schedule.ok) {
    switch (schedule.reason) {
      case "past":
        return { ok: false, error: "Dit moment ligt in het verleden.", field: "time" };
      case "outside-opening-hours":
        return { ok: false, error: schedule.message, field: "time" };
      case "busy":
        return { ok: false, error: SLOT_TAKEN_PUBLIC, field: "time" };
    }
  }

  const id = deps.ids.newId();
  const token = deps.ids.newToken();

  const saveResult = await deps.bookings.insert({
    id,
    serviceId: service.id,
    customerName: input.customerName,
    customerEmail: input.customerEmail,
    customerPhone: input.customerPhone,
    date: input.date,
    time,
    cancelToken: token,
  });

  // De unieke index in de database is de laatste verdediging tegen twee
  // gelijktijdige boekingen op hetzelfde moment.
  if (!saveResult.ok) return { ok: false, error: SLOT_TAKEN_PUBLIC, field: "time" };

  const { customerMailSent } = await deps.notifier.bookingCreated(
    buildMailData(
      {
        id,
        cancelToken: token,
        customerName: input.customerName,
        customerEmail: input.customerEmail,
        customerPhone: input.customerPhone,
        date: input.date,
        time,
      },
      service,
    ),
  );

  return {
    ok: true,
    booking: {
      id,
      date: input.date,
      time,
      serviceName: service.name,
      customerName: input.customerName,
      customerEmail: input.customerEmail,
    },
    emailSent: customerMailSent,
  };
}
