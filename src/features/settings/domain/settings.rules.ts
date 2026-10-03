import { DEFAULT_OPENING_HOURS } from "./opening-hours.rules";
import type { AdminSettings, BusinessSettings, PublicSettings } from "./settings.entity";

export const DEFAULT_SETTINGS: BusinessSettings = {
  businessName: "Barber",
  adminEmail: null,
  phoneNumber: null,
  address: null,
  openingHours: DEFAULT_OPENING_HOURS,
};

/** Without a row in the database (or during an outage) the site falls back to safe defaults. */
export function withDefaults(settings: BusinessSettings | null): BusinessSettings {
  return settings ?? DEFAULT_SETTINGS;
}

/** Deliberately an allowlist: new fields on BusinessSettings do not leak to the browser by themselves. */
export function toPublicSettings(settings: BusinessSettings | null): PublicSettings {
  const { businessName, address, phoneNumber, openingHours } = withDefaults(settings);
  return { businessName, address, phoneNumber, openingHours };
}

export function toAdminSettings(settings: BusinessSettings | null): AdminSettings {
  const full = withDefaults(settings);
  return { ...full, emailConfigured: Boolean(full.adminEmail) };
}
