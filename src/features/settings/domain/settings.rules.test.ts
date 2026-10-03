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
  it("never gives the notification address to visitors", () => {
    expect(toPublicSettings(settings)).not.toHaveProperty("adminEmail");
  });

  it("falls back to defaults without a row in the database", () => {
    expect(toPublicSettings(null).businessName).toBe("Barber");
  });
});

describe("naarAdminInstellingen", () => {
  it("reports whether the notification address is configured", () => {
    expect(toAdminSettings(settings).emailConfigured).toBe(true);
    expect(toAdminSettings({ ...settings, adminEmail: null }).emailConfigured).toBe(false);
    expect(toAdminSettings(null).emailConfigured).toBe(false);
  });
});
