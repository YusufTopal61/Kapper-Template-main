import "server-only";
import type { PubliekeInstellingen } from "@/modules/settings/domain/settings.entity";
import { getSiteUrl } from "@/shared/lib/env.server";
import type { BedrijfsGegevens } from "@/shared/seo/structured-data";

/** Vertaalt de bedrijfsgegevens uit de database naar wat de JSON-LD-builders nodig hebben. */
export function bedrijfsGegevens(instellingen: PubliekeInstellingen): BedrijfsGegevens {
  return {
    naam: instellingen.bedrijfsnaam,
    url: getSiteUrl(),
    telefoon: instellingen.telefoonnummer,
    adres: instellingen.adres,
    openingstijden: instellingen.openingstijden,
  };
}
