import { z } from "zod";
import { emailSchema, timeSchema } from "@/lib/validations/primitives";
import { WEEKDAYS } from "./opening-hours.rules";

const dayOpeningHoursSchema = z.object({
  open: z.boolean(),
  from: timeSchema,
  to: timeSchema,
});

export const openingHoursSchema = z
  .object(
    Object.fromEntries(WEEKDAYS.map((day) => [day, dayOpeningHoursSchema])) as Record<
      (typeof WEEKDAYS)[number],
      typeof dayOpeningHoursSchema
    >,
  )
  .refine(
    (hours) => Object.values(hours).every((day) => !day.open || day.from < day.to),
    "Openingstijd moet vóór sluitingstijd liggen.",
  );

/** Lege invoer wordt `null`: zo kan de beheerder een veld weer leegmaken. */
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .or(z.literal(""))
    .transform((value) => value || null)
    .nullable();

export const settingsInputSchema = z.object({
  businessName: z.string().trim().min(1, "Vul een bedrijfsnaam in.").max(120),
  adminEmail: emailSchema
    .or(z.literal(""))
    .transform((value) => value || null)
    .nullable(),
  phoneNumber: optionalText(40),
  address: optionalText(300),
  openingHours: openingHoursSchema,
});

export type SettingsInput = z.infer<typeof settingsInputSchema>;
