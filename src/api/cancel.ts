import { createServerFn } from "@tanstack/react-start";
import { getSupabaseAdminClient } from "@/lib/supabase/supabase.server";
import { cancelByTokenSchema } from "@/lib/validation";
import { normaliseerTijd } from "@/lib/opening-hours";
import { verstuurEmails } from "@/lib/email/send";
import {
  annuleringAdmin,
  annuleringBevestigdKlant,
  type EmailBooking,
} from "@/lib/email/templates";
import type { BookingStatus } from "@/lib/supabase/types";
import { adminBoekingUrl, getSiteUrl, leesInstellingen } from "./common.server";
import { limietOverschreden, zoekOpToken } from "./cancel.server";

export type BoekingViaToken = {
  id: string;
  klant_naam: string;
  datum: string;
  tijd: string;
  status: BookingStatus;
  dienstNaam: string;
  prijs: number | null;
  duurMinuten: number | null;
  bedrijfsnaam: string;
  adres: string | null;
};

export const fetchBookingByToken = createServerFn({ method: "POST" })
  .inputValidator(cancelByTokenSchema)
  .handler(
    async ({
      data,
    }): Promise<{ ok: true; boeking: BoekingViaToken } | { ok: false; error: string }> => {
      if (limietOverschreden("annuleer-lees")) {
        return { ok: false, error: "Te veel pogingen. Probeer het straks opnieuw." };
      }

      const rij = await zoekOpToken(data.bookingId, data.token);
      if (!rij) {
        return { ok: false, error: "Deze annuleerlink is niet (meer) geldig." };
      }

      const instellingen = await leesInstellingen();

      return {
        ok: true,
        boeking: {
          id: rij.id,
          klant_naam: rij.klant_naam,
          datum: rij.datum,
          tijd: normaliseerTijd(rij.tijd),
          status: rij.status,
          dienstNaam: rij.services?.naam ?? "Behandeling",
          prijs: rij.services?.prijs ?? null,
          duurMinuten: rij.services?.duur_minuten ?? null,
          bedrijfsnaam: instellingen?.bedrijfsnaam ?? "Barber",
          adres: instellingen?.adres ?? null,
        },
      };
    },
  );

export const cancelBookingByToken = createServerFn({ method: "POST" })
  .inputValidator(cancelByTokenSchema)
  .handler(async ({ data }): Promise<{ ok: true } | { ok: false; error: string }> => {
    if (limietOverschreden("annuleer-actie")) {
      return { ok: false, error: "Te veel pogingen. Probeer het straks opnieuw." };
    }

    const rij = await zoekOpToken(data.bookingId, data.token);
    if (!rij) {
      return { ok: false, error: "Deze annuleerlink is niet (meer) geldig." };
    }

    if (rij.status === "geannuleerd") {
      return { ok: false, error: "Deze afspraak is al geannuleerd." };
    }

    if (rij.status === "voltooid") {
      return {
        ok: false,
        error: "Deze afspraak is al geweest en kan niet meer geannuleerd worden.",
      };
    }

    const admin = getSupabaseAdminClient();
    const { error } = await admin
      .from("bookings")
      .update({ status: "geannuleerd" })
      .eq("id", rij.id)
      .eq("annuleer_token", data.token);

    if (error) throw error;

    const instellingen = await leesInstellingen();
    const bedrijf = {
      bedrijfsnaam: instellingen?.bedrijfsnaam ?? "Barber",
      adres: instellingen?.adres ?? null,
      telefoonnummer: instellingen?.telefoonnummer ?? null,
    };

    const emailBoeking: EmailBooking = {
      id: rij.id,
      klant_naam: rij.klant_naam,
      klant_email: rij.klant_email,
      klant_telefoon: rij.klant_telefoon,
      datum: rij.datum,
      tijd: normaliseerTijd(rij.tijd),
      dienstNaam: rij.services?.naam ?? "Behandeling",
      prijs: rij.services?.prijs ?? null,
      duurMinuten: rij.services?.duur_minuten ?? null,
    };

    await verstuurEmails([
      {
        naar: rij.klant_email,
        inhoud: annuleringBevestigdKlant(emailBoeking, bedrijf, `${getSiteUrl()}/boeken`),
      },
      {
        naar: instellingen?.admin_email ?? null,
        inhoud: annuleringAdmin(emailBoeking, bedrijf, adminBoekingUrl(), true),
      },
    ]);

    return { ok: true };
  });
