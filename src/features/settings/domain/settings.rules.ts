import { DEFAULT_OPENING_HOURS } from "./opening-hours.rules";
import type { AdminSettings, BusinessSettings, PublicSettings } from "./settings.entity";

export const DEFAULT_SETTINGS: BusinessSettings = {
  businessName: "Barber",
  adminEmail: null,
  phoneNumber: null,
  address: null,
  openingHours: DEFAULT_OPENING_HOURS,
};

/** Zonder rij in de database (of bij een storing) valt de site terug op veilige defaults. */
export function withDefaults(settings: BusinessSettings | null): BusinessSettings {
  return settings ?? DEFAULT_SETTINGS;
}

/** Bewust een allowlist: nieuwe velden op BusinessSettings lekken zo niet vanzelf naar de browser. */
export function toPublicSettings(settings: BusinessSettings | null): PublicSettings {
  const { businessName, address, phoneNumber, openingHours } = withDefaults(settings);
  return { businessName, address, phoneNumber, openingHours };
}

export function toAdminSettings(settings: BusinessSettings | null): AdminSettings {
  const full = withDefaults(settings);
  return { ...full, emailConfigured: Boolean(full.adminEmail) };
}
