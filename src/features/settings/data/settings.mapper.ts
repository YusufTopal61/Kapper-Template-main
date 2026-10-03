import { logger } from "@/lib/logger";
import type { Json, Tables, TablesUpdate } from "@/lib/supabase/database.types";
import { DEFAULT_OPENING_HOURS, WEEKDAYS } from "../domain/opening-hours.rules";
import type { BusinessSettings, OpeningHours, Weekday } from "../domain/settings.entity";
import { openingHoursSchema, type SettingsInput } from "../domain/settings.schema";

/**
 * The live schema uses Dutch column names, and the opening hours JSON uses Dutch
 * keys (`maandag`, `van`, `tot`). This file is the only place that knows them:
 * everything above the data layer works with the English entity.
 */

const DUTCH_WEEKDAYS: Record<Weekday, string> = {
  monday: "maandag",
  tuesday: "dinsdag",
  wednesday: "woensdag",
  thursday: "donderdag",
  friday: "vrijdag",
  saturday: "zaterdag",
  sunday: "zondag",
};

function isJsonObject(value: Json | undefined): value is { [key: string]: Json | undefined } {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Translates the stored JSON to the domain shape. The result is validated by the caller. */
export function fromDbOpeningHours(json: Json): unknown {
  if (!isJsonObject(json)) return json;

  return Object.fromEntries(
    WEEKDAYS.map((weekday) => {
      const day = json[DUTCH_WEEKDAYS[weekday]];
      return [
        weekday,
        isJsonObject(day) ? { open: day["open"], from: day["van"], to: day["tot"] } : day,
      ];
    }),
  );
}

export function toDbOpeningHours(hours: OpeningHours): Json {
  return Object.fromEntries(
    WEEKDAYS.map((weekday) => {
      const day = hours[weekday];
      return [DUTCH_WEEKDAYS[weekday], { open: day.open, van: day.from, tot: day.to }];
    }),
  );
}

/**
 * The opening hours come out of a JSON column, so they are validated here
 * instead of trusted: a malformed value falls back to the defaults rather than
 * breaking the site.
 */
export function toBusinessSettings(row: Tables<"admin_settings">): BusinessSettings {
  const openingHours = openingHoursSchema.safeParse(fromDbOpeningHours(row.openingstijden));

  if (!openingHours.success) {
    logger.warn("settings", "openingstijden in the database is invalid, using defaults");
  }

  return {
    businessName: row.bedrijfsnaam,
    adminEmail: row.admin_email,
    phoneNumber: row.telefoonnummer,
    address: row.adres,
    openingHours: openingHours.success ? openingHours.data : DEFAULT_OPENING_HOURS,
  };
}

export function toSettingsUpdate(input: SettingsInput): TablesUpdate<"admin_settings"> {
  return {
    bedrijfsnaam: input.businessName,
    admin_email: input.adminEmail,
    telefoonnummer: input.phoneNumber,
    adres: input.address,
    openingstijden: toDbOpeningHours(input.openingHours),
  };
}
