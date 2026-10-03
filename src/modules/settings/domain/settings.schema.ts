import { z } from "zod";
import { emailSchema, tijdSchema } from "@/shared/domain/primitives";
import { DAGEN } from "./opening-hours.rules";

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

/** Lege invoer wordt `null`: zo kan de beheerder een veld weer leegmaken. */
const optioneleTekst = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .or(z.literal(""))
    .transform((waarde) => waarde || null)
    .nullable();

export const settingsInputSchema = z.object({
  bedrijfsnaam: z.string().trim().min(1, "Vul een bedrijfsnaam in.").max(120),
  admin_email: emailSchema
    .or(z.literal(""))
    .transform((waarde) => waarde || null)
    .nullable(),
  telefoonnummer: optioneleTekst(40),
  adres: optioneleTekst(300),
  openingstijden: openingstijdenSchema,
});

export type SettingsInput = z.infer<typeof settingsInputSchema>;
