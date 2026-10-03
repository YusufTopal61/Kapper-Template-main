import { logger } from "@/lib/logger";
import type { Json, Tables, TablesUpdate } from "@/lib/supabase/database.types";
import { DEFAULT_OPENING_HOURS } from "../domain/opening-hours.rules";
import type { BusinessSettings } from "../domain/settings.entity";
import { openingHoursSchema, type SettingsInput } from "../domain/settings.schema";

/**
 * The only place that knows the settings column names. The opening hours come
 * out of a JSON column, so they are validated here instead of trusted: a
 * malformed value falls back to the defaults rather than breaking the site.
 */
export function toBusinessSettings(row: Tables<"admin_settings">): BusinessSettings {
  const openingHours = openingHoursSchema.safeParse(row.opening_hours);

  if (!openingHours.success) {
    logger.warn("settings", "opening_hours in the database is invalid, using defaults");
  }

  return {
    businessName: row.business_name,
    adminEmail: row.admin_email,
    phoneNumber: row.phone_number,
    address: row.address,
    openingHours: openingHours.success ? openingHours.data : DEFAULT_OPENING_HOURS,
  };
}

export function toSettingsUpdate(input: SettingsInput): TablesUpdate<"admin_settings"> {
  return {
    business_name: input.businessName,
    admin_email: input.adminEmail,
    phone_number: input.phoneNumber,
    address: input.address,
    // OpeningHours is a plain object of booleans and strings, so it is valid JSON.
    opening_hours: input.openingHours satisfies Json,
  };
}
