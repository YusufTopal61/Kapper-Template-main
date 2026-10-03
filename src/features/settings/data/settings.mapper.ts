import type { AdminSettingsRow } from "@/shared/lib/supabase/database.types";
import type { BusinessSettings } from "../domain/settings.entity";

export function naarBusinessSettings(rij: AdminSettingsRow): BusinessSettings {
  return {
    bedrijfsnaam: rij.bedrijfsnaam,
    admin_email: rij.admin_email,
    telefoonnummer: rij.telefoonnummer,
    adres: rij.adres,
    openingstijden: rij.openingstijden,
  };
}
