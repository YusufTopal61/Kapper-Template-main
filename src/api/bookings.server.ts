import { getSupabaseAdminClient } from "@/lib/supabase/supabase.server";
import { normaliseerTijd, tijdNaarMinuten } from "@/lib/opening-hours";
import type { EmailBedrijf } from "@/lib/email/templates";
import { leesInstellingen } from "./common.server";

/** Statussen die een tijdslot bezet houden. Geannuleerd telt dus niet mee. */
const ACTIEVE_STATUSSEN = ["bevestigd", "voltooid", "no_show"] as const;

export type BezetteRange = { start: number; eind: number };

/**
 * Alle bezette tijdvakken op een dag, in minuten sinds middernacht.
 * Met `negeerBookingId` sluit je de afspraak uit die je zelf aan het
 * verplaatsen bent — die zou anders met zichzelf botsen.
 */
export async function bezetteRanges(
  datum: string,
  negeerBookingId?: string,
): Promise<BezetteRange[]> {
  const admin = getSupabaseAdminClient();

  const { data, error } = await admin
    .from("bookings")
    .select("id, tijd, services(duur_minuten)")
    .eq("datum", datum)
    .in("status", ACTIEVE_STATUSSEN);

  if (error) throw error;

  return (data ?? [])
    .filter((rij) => rij.id !== negeerBookingId)
    .map((rij) => {
      const start = tijdNaarMinuten(normaliseerTijd(rij.tijd));
      const duur =
        (rij as unknown as { services: { duur_minuten: number } | null }).services?.duur_minuten ??
        30;
      return { start, eind: start + duur };
    });
}

/** Botst een behandeling van `duur` minuten vanaf `start` met iets bestaands? */
export function overlapt(start: number, duur: number, ranges: BezetteRange[]) {
  const eind = start + duur;
  return ranges.some((range) => start < range.eind && eind > range.start);
}

export async function bedrijfsgegevens(): Promise<{
  bedrijf: EmailBedrijf;
  adminEmail: string | null;
}> {
  const instellingen = await leesInstellingen();
  return {
    bedrijf: {
      bedrijfsnaam: instellingen?.bedrijfsnaam ?? "Barber",
      adres: instellingen?.adres ?? null,
      telefoonnummer: instellingen?.telefoonnummer ?? null,
    },
    adminEmail: instellingen?.admin_email ?? null,
  };
}
