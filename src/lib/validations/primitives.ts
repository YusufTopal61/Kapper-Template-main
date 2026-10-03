import { z } from "zod";

/**
 * Zod-bouwstenen die door meerdere modules gebruikt worden. Puur Zod, geen
 * framework: daarom mag domain/ ze importeren.
 */

/** RFC 5321 staat maximaal 254 tekens toe — een langere string is sowieso geen geldig adres. */
export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .max(254, "Dit e-mailadres is te lang.")
  .email("Vul een geldig e-mailadres in.");

export const timeSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/, "Ongeldige tijd. Verwacht formaat: UU:MM.");

export const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Ongeldige datum. Verwacht formaat: JJJJ-MM-DD.");
