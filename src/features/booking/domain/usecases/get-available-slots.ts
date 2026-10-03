import { metDefaults } from "@/modules/settings/domain/settings.rules";
import type { BookingDeps } from "../booking.deps";
import type { Tijdslot } from "../booking.entity";
import { bepaalTijdsloten, naarBusyRanges } from "../booking.rules";
import type { BeschikbareSlotenInput } from "../booking.schema";

/** Publiek: welke tijdsloten zijn er die dag nog vrij voor deze dienst? */
export async function getAvailableSlots(
  deps: Pick<BookingDeps, "bookings" | "services" | "settings" | "now">,
  input: BeschikbareSlotenInput,
): Promise<{ sloten: Tijdslot[]; gesloten: boolean }> {
  const dienst = await deps.services.findById(input.service_id);
  if (!dienst || !dienst.actief) return { sloten: [], gesloten: true };

  const { openingstijden } = metDefaults(await deps.settings.read());
  const bezet = naarBusyRanges(await deps.bookings.listBusy(input.datum));

  return bepaalTijdsloten({
    openingstijden,
    datum: input.datum,
    duurMinuten: dienst.duur_minuten,
    bezet,
    ...(deps.now ? { nu: deps.now() } : {}),
  });
}
