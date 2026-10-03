import "server-only";
import { metDefaults } from "@/modules/settings/domain/settings.rules";
import type { SettingsRepository } from "@/modules/settings/domain/settings.repository";
import type { BookingNotifier } from "../domain/booking.ports";
import type { BookingMailData } from "../domain/booking.entity";
import { adminBoekingUrl, annuleerUrl, opnieuwBoekenUrl } from "./links";
import { verstuurEmails } from "./mailer";
import {
  afspraakGewijzigdKlant,
  annuleringAdmin,
  annuleringBevestigdKlant,
  boekingsbevestigingKlant,
  nieuweBoekingAdmin,
  type EmailBedrijf,
  type EmailBooking,
} from "./mail-templates";

function naarEmailBooking(boeking: BookingMailData): EmailBooking {
  return {
    id: boeking.id,
    klant_naam: boeking.klant_naam,
    klant_email: boeking.klant_email,
    klant_telefoon: boeking.klant_telefoon,
    datum: boeking.datum,
    tijd: boeking.tijd,
    dienstNaam: boeking.dienstNaam,
    prijs: boeking.prijs,
    duurMinuten: boeking.duurMinuten,
  };
}

/**
 * Verstuurt de mails rond een boeking via Resend. Elke methode vangt al haar
 * fouten af: de afspraak staat op dat moment al, en een mislukte mail mag die
 * niet terugdraaien. Fouten worden gelogd, niet doorgegeven.
 */
export function createResendBookingNotifier(deps: {
  settings: Pick<SettingsRepository, "read">;
}): BookingNotifier {
  async function context() {
    const instellingen = metDefaults(await deps.settings.read());
    const bedrijf: EmailBedrijf = {
      bedrijfsnaam: instellingen.bedrijfsnaam,
      adres: instellingen.adres,
      telefoonnummer: instellingen.telefoonnummer,
    };
    return { bedrijf, adminEmail: instellingen.admin_email };
  }

  return {
    async bookingCreated(boeking) {
      try {
        const { bedrijf, adminEmail } = await context();
        const mail = naarEmailBooking(boeking);

        const resultaten = await verstuurEmails([
          {
            naar: boeking.klant_email,
            inhoud: boekingsbevestigingKlant(
              mail,
              bedrijf,
              await annuleerUrl(boeking.id, boeking.annuleer_token),
            ),
          },
          { naar: adminEmail, inhoud: nieuweBoekingAdmin(mail, bedrijf, await adminBoekingUrl()) },
        ]);

        return { klantMailVerzonden: resultaten[0]?.status === "verzonden" };
      } catch (error) {
        console.error("[booking] bevestigingsmails versturen mislukt:", error);
        return { klantMailVerzonden: false };
      }
    },

    async bookingCancelled(boeking, door) {
      try {
        const { bedrijf, adminEmail } = await context();
        const mail = naarEmailBooking(boeking);

        await verstuurEmails([
          {
            naar: boeking.klant_email,
            inhoud: annuleringBevestigdKlant(mail, bedrijf, await opnieuwBoekenUrl()),
          },
          {
            naar: adminEmail,
            inhoud: annuleringAdmin(mail, bedrijf, await adminBoekingUrl(), door === "klant"),
          },
        ]);
      } catch (error) {
        console.error("[booking] annuleringsmails versturen mislukt:", error);
      }
    },

    async bookingRescheduled(boeking) {
      try {
        const { bedrijf } = await context();

        await verstuurEmails([
          {
            naar: boeking.klant_email,
            inhoud: afspraakGewijzigdKlant(
              naarEmailBooking(boeking),
              bedrijf,
              await annuleerUrl(boeking.id, boeking.annuleer_token),
            ),
          },
        ]);
      } catch (error) {
        console.error("[booking] wijzigingsmail versturen mislukt:", error);
      }
    },
  };
}
