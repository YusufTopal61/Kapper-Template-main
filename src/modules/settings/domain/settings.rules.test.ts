import { describe, expect, it } from "vitest";
import { DEFAULT_OPENINGSTIJDEN } from "./opening-hours.rules";
import { naarAdminInstellingen, naarPubliekeInstellingen } from "./settings.rules";
import type { BusinessSettings } from "./settings.entity";

const instellingen: BusinessSettings = {
  bedrijfsnaam: "Kapper X",
  admin_email: "prive@example.nl",
  telefoonnummer: "06 12345678",
  adres: "Straat 1, 1234 AB Stad",
  openingstijden: DEFAULT_OPENINGSTIJDEN,
};

describe("naarPubliekeInstellingen", () => {
  it("geeft het notificatie-adres nooit aan bezoekers", () => {
    expect(naarPubliekeInstellingen(instellingen)).not.toHaveProperty("admin_email");
  });

  it("valt terug op defaults zonder rij in de database", () => {
    expect(naarPubliekeInstellingen(null).bedrijfsnaam).toBe("Barber");
  });
});

describe("naarAdminInstellingen", () => {
  it("meldt of het notificatie-adres is ingesteld", () => {
    expect(naarAdminInstellingen(instellingen).emailIngesteld).toBe(true);
    expect(naarAdminInstellingen({ ...instellingen, admin_email: null }).emailIngesteld).toBe(
      false,
    );
    expect(naarAdminInstellingen(null).emailIngesteld).toBe(false);
  });
});
