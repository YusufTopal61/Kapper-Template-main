import { createServerFn } from "@tanstack/react-start";
import { getRequestIP } from "@tanstack/react-start/server";
import { getSupabaseAdminClient, getSupabaseServerClient } from "@/lib/supabase/supabase.server";
import {
  adminBookingUpdateSchema,
  beschikbareSlotenSchema,
  bookingIdSchema,
  bookingInputSchema,
} from "@/lib/validation";
import {
  DEFAULT_OPENINGSTIJDEN,
  ligtInVerleden,
  normaliseerTijd,
  tijdNaarMinuten,
  tijdslotenVoorDag,
  valtBinnenOpeningstijden,
} from "@/lib/opening-hours";
import { rateLimit } from "@/lib/rate-limit";
import { verstuurEmails } from "@/lib/email/send";
import {
  afspraakGewijzigdKlant,
  annuleringAdmin,
  annuleringBevestigdKlant,
  boekingsbevestigingKlant,
  nieuweBoekingAdmin,
  type EmailBooking,
} from "@/lib/email/templates";
import type { BookingWithService } from "@/lib/supabase/types";
import {
  adminBoekingUrl,
  annuleerUrl,
  getSiteUrl,
  leesInstellingen,
  maakAnnuleerToken,
  requireAdmin,
} from "./common.server";
import { bedrijfsgegevens, bezetteRanges, overlapt } from "./bookings.server";

// ------------------------------------------------------------ beschikbaarheid

export type Tijdslot = { tijd: string; beschikbaar: boolean };

/** Tijdsloten voor een dag, met per slot of de behandeling er nog in past. */
export const fetchAvailableSlots = createServerFn({ method: "POST" })
  .inputValidator(beschikbareSlotenSchema)
  .handler(async ({ data }): Promise<{ sloten: Tijdslot[]; gesloten: boolean }> => {
    const admin = getSupabaseAdminClient();

    const { data: dienst, error: dienstFout } = await admin
      .from("services")
      .select("duur_minuten, actief")
      .eq("id", data.service_id)
      .maybeSingle();

    if (dienstFout) throw dienstFout;
    if (!dienst || !dienst.actief) return { sloten: [], gesloten: true };

    const instellingen = await leesInstellingen();
    const openingstijden = instellingen?.openingstijden ?? DEFAULT_OPENINGSTIJDEN;

    const kandidaten = tijdslotenVoorDag(openingstijden, data.datum, dienst.duur_minuten);
    if (kandidaten.length === 0) return { sloten: [], gesloten: true };

    const ranges = await bezetteRanges(data.datum);

    const sloten = kandidaten.map((tijd) => ({
      tijd,
      beschikbaar:
        !ligtInVerleden(data.datum, tijd) &&
        !overlapt(tijdNaarMinuten(tijd), dienst.duur_minuten, ranges),
    }));

    return { sloten, gesloten: false };
  });

// ------------------------------------------------------------ boeking maken

export type BoekingResultaat =
  | {
      ok: true;
      boeking: {
        id: string;
        datum: string;
        tijd: string;
        dienstNaam: string;
        klant_naam: string;
        klant_email: string;
      };
      emailVerzonden: boolean;
    }
  | { ok: false; error: string; veld?: "datum" | "tijd" | "service_id" };

export const createBooking = createServerFn({ method: "POST" })
  .inputValidator(bookingInputSchema)
  .handler(async ({ data }): Promise<BoekingResultaat> => {
    const ip = getRequestIP({ xForwardedFor: true }) ?? "onbekend";
    const limiet = rateLimit(`boeking:${ip}`, { max: 5, vensterMs: 10 * 60 * 1000 });

    if (!limiet.toegestaan) {
      return {
        ok: false,
        error: `Te veel boekingspogingen. Probeer het over ${limiet.opnieuwProberenOverSeconden} seconden opnieuw.`,
      };
    }

    const admin = getSupabaseAdminClient();
    const tijd = normaliseerTijd(data.tijd);

    const { data: dienst, error: dienstFout } = await admin
      .from("services")
      .select("id, naam, prijs, duur_minuten, actief")
      .eq("id", data.service_id)
      .maybeSingle();

    if (dienstFout) throw dienstFout;
    if (!dienst || !dienst.actief) {
      return { ok: false, error: "Deze dienst is niet meer beschikbaar.", veld: "service_id" };
    }

    if (ligtInVerleden(data.datum, tijd)) {
      return { ok: false, error: "Dit moment ligt in het verleden.", veld: "tijd" };
    }

    const instellingen = await leesInstellingen();
    const openingstijden = instellingen?.openingstijden ?? DEFAULT_OPENINGSTIJDEN;

    const binnenTijden = valtBinnenOpeningstijden(
      openingstijden,
      data.datum,
      tijd,
      dienst.duur_minuten,
    );
    if (!binnenTijden.ok) {
      return { ok: false, error: binnenTijden.reden, veld: "tijd" };
    }

    const ranges = await bezetteRanges(data.datum);
    if (overlapt(tijdNaarMinuten(tijd), dienst.duur_minuten, ranges)) {
      return {
        ok: false,
        error: "Dit tijdslot is net bezet geraakt. Kies een ander moment.",
        veld: "tijd",
      };
    }

    const id = crypto.randomUUID();
    const token = maakAnnuleerToken();

    // Bewust met de anon-client: zo loopt het aanmaken écht door de publieke
    // RLS-policy heen, precies zoals een externe aanroep dat zou doen.
    const supabase = getSupabaseServerClient();
    const { error: insertFout } = await supabase.from("bookings").insert({
      id,
      service_id: dienst.id,
      klant_naam: data.klant_naam,
      klant_email: data.klant_email,
      klant_telefoon: data.klant_telefoon,
      datum: data.datum,
      tijd,
      annuleer_token: token,
    });

    if (insertFout) {
      // 23505 = unique violation op het tijdslot-index: iemand was net sneller.
      if (insertFout.code === "23505") {
        return {
          ok: false,
          error: "Dit tijdslot is net bezet geraakt. Kies een ander moment.",
          veld: "tijd",
        };
      }
      throw insertFout;
    }

    const { bedrijf, adminEmail } = await bedrijfsgegevens();

    const emailBoeking: EmailBooking = {
      id,
      klant_naam: data.klant_naam,
      klant_email: data.klant_email,
      klant_telefoon: data.klant_telefoon,
      datum: data.datum,
      tijd,
      dienstNaam: dienst.naam,
      prijs: dienst.prijs,
      duurMinuten: dienst.duur_minuten,
    };

    // E-mail mag de boeking nooit laten mislukken: de afspraak staat al.
    const resultaten = await verstuurEmails([
      {
        naar: data.klant_email,
        inhoud: boekingsbevestigingKlant(emailBoeking, bedrijf, annuleerUrl(id, token)),
      },
      {
        naar: adminEmail,
        inhoud: nieuweBoekingAdmin(emailBoeking, bedrijf, adminBoekingUrl()),
      },
    ]);

    return {
      ok: true,
      boeking: {
        id,
        datum: data.datum,
        tijd,
        dienstNaam: dienst.naam,
        klant_naam: data.klant_naam,
        klant_email: data.klant_email,
      },
      emailVerzonden: resultaten[0]?.status === "verzonden",
    };
  });

// ------------------------------------------------------------ beheer

export const fetchAdminBookings = createServerFn({ method: "GET" }).handler(
  async (): Promise<BookingWithService[]> => {
    const { supabase } = await requireAdmin();

    const { data, error } = await supabase
      .from("bookings")
      .select("*, services(id, naam, prijs, duur_minuten)")
      .order("datum", { ascending: true })
      .order("tijd", { ascending: true });

    if (error) throw error;
    return (data ?? []) as unknown as BookingWithService[];
  },
);

export const updateBooking = createServerFn({ method: "POST" })
  .inputValidator(adminBookingUpdateSchema)
  .handler(async ({ data }) => {
    const { supabase } = await requireAdmin();
    const { id, ...velden } = data;

    const { data: huidig, error: leesFout } = await supabase
      .from("bookings")
      .select("*, services(id, naam, prijs, duur_minuten)")
      .eq("id", id)
      .maybeSingle();

    if (leesFout) throw leesFout;
    if (!huidig) return { ok: false as const, error: "Deze boeking bestaat niet meer." };

    const nieuweDatum = velden.datum ?? huidig.datum;
    const nieuweTijd = normaliseerTijd(velden.tijd ?? huidig.tijd);
    const nieuweStatus = velden.status ?? huidig.status;
    const nieuweServiceId = velden.service_id ?? huidig.service_id;

    const admin = getSupabaseAdminClient();

    const { data: dienst } = await admin
      .from("services")
      .select("id, naam, prijs, duur_minuten")
      .eq("id", nieuweServiceId)
      .maybeSingle();

    const duur = dienst?.duur_minuten ?? 30;

    // Alleen controleren zolang de afspraak actief blijft; een geannuleerde
    // afspraak hoeft niet meer in het rooster te passen.
    if (nieuweStatus !== "geannuleerd") {
      const instellingen = await leesInstellingen();
      const binnenTijden = valtBinnenOpeningstijden(
        instellingen?.openingstijden ?? DEFAULT_OPENINGSTIJDEN,
        nieuweDatum,
        nieuweTijd,
        duur,
      );
      if (!binnenTijden.ok) {
        return { ok: false as const, error: binnenTijden.reden };
      }

      const ranges = await bezetteRanges(nieuweDatum, id);
      if (overlapt(tijdNaarMinuten(nieuweTijd), duur, ranges)) {
        return {
          ok: false as const,
          error: "Op dit moment staat al een andere afspraak. Kies een ander tijdslot.",
        };
      }
    }

    const { data: bijgewerkt, error: updateFout } = await supabase
      .from("bookings")
      .update({
        ...velden,
        tijd: velden.tijd ? nieuweTijd : undefined,
      })
      .eq("id", id)
      .select("*, services(id, naam, prijs, duur_minuten)")
      .single();

    if (updateFout) {
      if (updateFout.code === "23505") {
        return {
          ok: false as const,
          error: "Op dit moment staat al een andere afspraak. Kies een ander tijdslot.",
        };
      }
      throw updateFout;
    }

    // Bepalen welke mail de klant hoort te krijgen.
    const isGeannuleerd = nieuweStatus === "geannuleerd" && huidig.status !== "geannuleerd";
    const isVerzet =
      !isGeannuleerd &&
      nieuweStatus !== "geannuleerd" &&
      (nieuweDatum !== huidig.datum ||
        nieuweTijd !== normaliseerTijd(huidig.tijd) ||
        nieuweServiceId !== huidig.service_id);

    if (isGeannuleerd || isVerzet) {
      const { bedrijf, adminEmail } = await bedrijfsgegevens();
      const emailBoeking: EmailBooking = {
        id,
        klant_naam: bijgewerkt.klant_naam,
        klant_email: bijgewerkt.klant_email,
        klant_telefoon: bijgewerkt.klant_telefoon,
        datum: bijgewerkt.datum,
        tijd: bijgewerkt.tijd,
        dienstNaam: dienst?.naam ?? "Behandeling",
        prijs: dienst?.prijs ?? null,
        duurMinuten: dienst?.duur_minuten ?? null,
      };

      if (isGeannuleerd) {
        await verstuurEmails([
          {
            naar: bijgewerkt.klant_email,
            inhoud: annuleringBevestigdKlant(emailBoeking, bedrijf, `${getSiteUrl()}/boeken`),
          },
          {
            naar: adminEmail,
            inhoud: annuleringAdmin(emailBoeking, bedrijf, adminBoekingUrl(), false),
          },
        ]);
      } else {
        await verstuurEmails([
          {
            naar: bijgewerkt.klant_email,
            inhoud: afspraakGewijzigdKlant(
              emailBoeking,
              bedrijf,
              annuleerUrl(id, bijgewerkt.annuleer_token),
            ),
          },
        ]);
      }
    }

    return { ok: true as const, boeking: bijgewerkt as unknown as BookingWithService };
  });

export const cancelBookingAdmin = createServerFn({ method: "POST" })
  .inputValidator(bookingIdSchema)
  .handler(async ({ data }) => {
    // Hergebruikt bewust dezelfde route als een gewone wijziging, zodat de
    // annuleringsmails maar op één plek geregeld zijn.
    return updateBooking({ data: { id: data.id, status: "geannuleerd" } });
  });
