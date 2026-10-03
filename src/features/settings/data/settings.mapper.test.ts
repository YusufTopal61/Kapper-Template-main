import { describe, expect, it } from "vitest";
import type { Tables } from "@/lib/supabase/database.types";
import { DEFAULT_OPENING_HOURS } from "../domain/opening-hours.rules";
import {
  fromDbOpeningHours,
  toBusinessSettings,
  toDbOpeningHours,
  toSettingsUpdate,
} from "./settings.mapper";

const dutchHours = {
  maandag: { open: false, van: "09:00", tot: "18:00" },
  dinsdag: { open: true, van: "09:00", tot: "18:00" },
  woensdag: { open: true, van: "09:00", tot: "18:00" },
  donderdag: { open: true, van: "09:00", tot: "18:00" },
  vrijdag: { open: true, van: "09:00", tot: "18:00" },
  zaterdag: { open: true, van: "09:00", tot: "17:00" },
  zondag: { open: false, van: "09:00", tot: "18:00" },
};

const row: Tables<"admin_settings"> = {
  id: "x",
  singleton: true,
  bedrijfsnaam: "Kapper X",
  admin_email: "baas@example.nl",
  telefoonnummer: "06 12345678",
  adres: "Straat 1, 1234 AB Stad",
  openingstijden: dutchHours,
  updated_at: "2026-09-01T00:00:00Z",
};

describe("settings mapper (Dutch columns <-> English entity)", () => {
  it("maps a row, translating the opening hours JSON", () => {
    const settings = toBusinessSettings(row);

    expect(settings).toMatchObject({
      businessName: "Kapper X",
      adminEmail: "baas@example.nl",
      phoneNumber: "06 12345678",
      address: "Straat 1, 1234 AB Stad",
    });
    expect(settings.openingHours.tuesday).toEqual({ open: true, from: "09:00", to: "18:00" });
    expect(settings.openingHours.saturday.to).toBe("17:00");
    expect(settings.openingHours.sunday.open).toBe(false);
  });

  it("round-trips the opening hours through the database format", () => {
    expect(fromDbOpeningHours(toDbOpeningHours(DEFAULT_OPENING_HOURS))).toEqual(
      DEFAULT_OPENING_HOURS,
    );
  });

  it("falls back to the defaults when the stored JSON is malformed", () => {
    expect(
      toBusinessSettings({ ...row, openingstijden: { maandag: "kapot" } }).openingHours,
    ).toEqual(DEFAULT_OPENING_HOURS);
    expect(toBusinessSettings({ ...row, openingstijden: null }).openingHours).toEqual(
      DEFAULT_OPENING_HOURS,
    );
  });

  it("writes Dutch columns and Dutch opening hours keys", () => {
    const update = toSettingsUpdate({
      businessName: "Kapper X",
      adminEmail: null,
      phoneNumber: null,
      address: null,
      openingHours: DEFAULT_OPENING_HOURS,
    });

    expect(update).toMatchObject({ bedrijfsnaam: "Kapper X", admin_email: null });
    expect(update.openingstijden).toMatchObject({
      maandag: { open: false, van: "09:00", tot: "18:00" },
    });
  });
});
