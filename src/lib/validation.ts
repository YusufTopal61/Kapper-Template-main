import { z } from "zod";
import { DAGEN } from "./opening-hours";

const datumSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Ongeldige datum. Verwacht formaat: JJJJ-MM-DD.");

const tijdSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/, "Ongeldige tijd. Verwacht formaat: UU:MM.");

/** RFC 5321 staat maximaal 254 tekens toe — een langere string is sowieso geen geldig adres. */
const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .max(254, "Dit e-mailadres is te lang.")
  .email("Vul een geldig e-mailadres in.");

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

export const bookingInputSchema = z.object({
  service_id: z.string().uuid("Kies een geldige dienst."),
  klant_naam: z.string().trim().min(2, "Vul je naam in.").max(120, "Deze naam is te lang."),
  klant_email: emailSchema,
  klant_telefoon: telefoonSchema,
  datum: datumSchema,
  tijd: tijdSchema,
});

export type BookingInput = z.infer<typeof bookingInputSchema>;

export const cancelByTokenSchema = z.object({
  bookingId: z.string().uuid(),
  // Het gegenereerde token is 64 hex-tekens; ruim boven die lengte is nooit geldig.
  token: z.string().min(16, "Ongeldige annuleerlink.").max(128, "Ongeldige annuleerlink."),
});

export const serviceInputSchema = z.object({
  naam: z.string().trim().min(2, "Vul een naam in.").max(120, "Deze naam is te lang."),
  beschrijving: z.string().trim().max(1000, "Deze beschrijving is te lang.").default(""),
  prijs: z.coerce.number().min(0, "Prijs kan niet negatief zijn.").max(100000),
  duur_minuten: z.coerce
    .number()
    .int("Duur moet in hele minuten.")
    .min(5, "Minimaal 5 minuten.")
    .max(480, "Maximaal 8 uur."),
  actief: z.boolean().default(true),
});

export const serviceUpdateSchema = serviceInputSchema.partial().extend({
  id: z.string().uuid(),
});

export const serviceIdSchema = z.object({ id: z.string().uuid() });

const dagOpeningstijdSchema = z.object({
  open: z.boolean(),
  van: tijdSchema,
  tot: tijdSchema,
});

export const openingstijdenSchema = z
  .object(
    Object.fromEntries(DAGEN.map((dag) => [dag, dagOpeningstijdSchema])) as Record<
      (typeof DAGEN)[number],
      typeof dagOpeningstijdSchema
    >,
  )
  .refine(
    (tijden) => Object.values(tijden).every((dag) => !dag.open || dag.van < dag.tot),
    "Openingstijd moet vóór sluitingstijd liggen.",
  );

export const settingsInputSchema = z.object({
  bedrijfsnaam: z.string().trim().min(1, "Vul een bedrijfsnaam in.").max(120),
  admin_email: emailSchema
    .or(z.literal(""))
    .transform((waarde) => waarde || null)
    .nullable(),
  telefoonnummer: z
    .string()
    .trim()
    .max(40)
    .or(z.literal(""))
    .transform((waarde) => waarde || null)
    .nullable(),
  adres: z
    .string()
    .trim()
    .max(300)
    .or(z.literal(""))
    .transform((waarde) => waarde || null)
    .nullable(),
  openingstijden: openingstijdenSchema,
});

export const bookingStatusSchema = z.enum(["bevestigd", "geannuleerd", "voltooid", "no_show"]);

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

export const loginSchema = z.object({
  email: emailSchema,
  // Bovengrens tegen een long-password DoS: extreem lange input maakt het
  // hash-algoritme van Supabase Auth onnodig duur om te verwerken.
  password: z
    .string()
    .min(8, "Wachtwoord moet minimaal 8 tekens zijn.")
    .max(128, "Wachtwoord mag maximaal 128 tekens zijn."),
});

export const beschikbareSlotenSchema = z.object({
  datum: datumSchema,
  service_id: z.string().uuid(),
});
