import { describe, expect, it } from "vitest";
import { DEFAULT_OPENING_HOURS } from "./opening-hours.rules";
import { toAdminSettings, toPublicSettings } from "./settings.rules";
import type { BusinessSettings } from "./settings.entity";

const settings: BusinessSettings = {
  businessName: "Kapper X",
  adminEmail: "prive@example.nl",
  phoneNumber: "06 12345678",
  address: "Straat 1, 1234 AB Stad",
  openingHours: DEFAULT_OPENING_HOURS,
};

describe("naarPubliekeInstellingen", () => {
  it("geeft het notificatie-adres nooit aan bezoekers", () => {
    expect(toPublicSettings(settings)).not.toHaveProperty("adminEmail");
  });

  it("valt terug op defaults zonder rij in de database", () => {
    expect(toPublicSettings(null).businessName).toBe("Barber");
  });
});

describe("naarAdminInstellingen", () => {
  it("meldt of het notificatie-adres is ingesteld", () => {
    expect(toAdminSettings(settings).emailConfigured).toBe(true);
    expect(toAdminSettings({ ...settings, adminEmail: null }).emailConfigured).toBe(false);
    expect(toAdminSettings(null).emailConfigured).toBe(false);
  });
});
