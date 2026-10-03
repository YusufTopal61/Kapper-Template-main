import { z } from "zod";
import { datumSchema, emailSchema, tijdSchema } from "@/shared/domain/primitives";

/**
 * Nederlands telefoonnummer, tolerant voor spaties, streepjes en +31.
 * 0612345678, 06 12 34 56 78, +31 6 12345678 en 010-1234567 zijn allemaal goed.
 */
const telefoonSchema = z
  .string()
  .trim()
  .min(1, "Vul je telefoonnummer in.")
  .max(30, "Dit telefoonnummer is te lang.")
  .refine((waarde) => {
    const cijfers = waarde.replace(/[\s-().]/g, "");
    return /^(\+31|0031|0)[1-9]\d{8}$/.test(cijfers);
  }, "Dit lijkt geen geldig Nederlands telefoonnummer.");

export const bookingStatusSchema = z.enum(["bevestigd", "geannuleerd", "voltooid", "no_show"]);

export const bookingInputSchema = z.object({
  service_id: z.string().uuid("Kies een geldige dienst."),
  klant_naam: z.string().trim().min(2, "Vul je naam in.").max(120, "Deze naam is te lang."),
  klant_email: emailSchema,
  klant_telefoon: telefoonSchema,
  datum: datumSchema,
  tijd: tijdSchema,
});

/** Alleen de klantgegevens, voor de laatste stap van het boekingsformulier. */
export const bookingKlantSchema = bookingInputSchema.pick({
  klant_naam: true,
  klant_email: true,
  klant_telefoon: true,
});

export const cancelByTokenSchema = z.object({
  bookingId: z.string().uuid(),
  // Het gegenereerde token is 64 hex-tekens; ruim boven die lengte is nooit geldig.
  token: z.string().min(16, "Ongeldige annuleerlink.").max(128, "Ongeldige annuleerlink."),
});

export const adminBookingUpdateSchema = z.object({
  id: z.string().uuid(),
  service_id: z.string().uuid().optional(),
  klant_naam: z.string().trim().min(2).max(120).optional(),
  klant_email: emailSchema.optional(),
  klant_telefoon: telefoonSchema.optional(),
  datum: datumSchema.optional(),
  tijd: tijdSchema.optional(),
  status: bookingStatusSchema.optional(),
  notities: z.string().trim().max(2000).nullable().optional(),
});

export const bookingIdSchema = z.object({ id: z.string().uuid() });

export const beschikbareSlotenSchema = z.object({
  datum: datumSchema,
  service_id: z.string().uuid(),
});

export type BookingInput = z.infer<typeof bookingInputSchema>;
export type BookingKlantInput = z.infer<typeof bookingKlantSchema>;
export type AdminBookingUpdate = z.infer<typeof adminBookingUpdateSchema>;
export type CancelByTokenInput = z.infer<typeof cancelByTokenSchema>;
export type BeschikbareSlotenInput = z.infer<typeof beschikbareSlotenSchema>;
