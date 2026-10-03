import { DEFAULT_OPENINGSTIJDEN } from "./opening-hours.rules";
import type { AdminInstellingen, BusinessSettings, PubliekeInstellingen } from "./settings.entity";

export const DEFAULT_INSTELLINGEN: BusinessSettings = {
  bedrijfsnaam: "Barber",
  admin_email: null,
  telefoonnummer: null,
  adres: null,
  openingstijden: DEFAULT_OPENINGSTIJDEN,
};

/** Zonder rij in de database (of bij een storing) valt de site terug op veilige defaults. */
export function metDefaults(instellingen: BusinessSettings | null): BusinessSettings {
  return instellingen ?? DEFAULT_INSTELLINGEN;
}

/** Bewust een allowlist: nieuwe velden op BusinessSettings lekken zo niet vanzelf naar de browser. */
export function naarPubliekeInstellingen(
  instellingen: BusinessSettings | null,
): PubliekeInstellingen {
  const { bedrijfsnaam, adres, telefoonnummer, openingstijden } = metDefaults(instellingen);
  return { bedrijfsnaam, adres, telefoonnummer, openingstijden };
}

export function naarAdminInstellingen(instellingen: BusinessSettings | null): AdminInstellingen {
  const volledig = metDefaults(instellingen);
  return { ...volledig, emailIngesteld: Boolean(volledig.admin_email) };
}
