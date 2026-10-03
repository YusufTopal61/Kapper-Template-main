import { z } from "zod";

export const serviceInputSchema = z.object({
  naam: z.string().trim().min(2, "Vul een naam in.").max(120, "Deze naam is te lang."),
  beschrijving: z.string().trim().max(1000, "Deze beschrijving is te lang.").default(""),
  prijs: z.coerce
    .number({ invalid_type_error: "Vul een prijs in." })
    .min(0, "Prijs kan niet negatief zijn.")
    .max(100000, "Deze prijs is te hoog."),
  duur_minuten: z.coerce
    .number({ invalid_type_error: "Vul de duur in minuten in." })
    .int("Duur moet in hele minuten.")
    .min(5, "Minimaal 5 minuten.")
    .max(480, "Maximaal 8 uur."),
  actief: z.boolean().default(true),
});

export const serviceUpdateSchema = serviceInputSchema.partial().extend({
  id: z.string().uuid(),
});

export const serviceIdSchema = z.object({ id: z.string().uuid() });

export type ServiceInput = z.infer<typeof serviceInputSchema>;
export type ServiceUpdate = z.infer<typeof serviceUpdateSchema>;
