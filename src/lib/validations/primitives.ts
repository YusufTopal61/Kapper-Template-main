import { z } from "zod";

/**
 * Zod building blocks used by several features. Pure Zod, no framework:
 * that is why domain/ may import them.
 */

/** RFC 5321 allows at most 254 characters — a longer string is never a valid address anyway. */
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
