import { z } from "zod";
import { emailSchema } from "@/lib/validations/primitives";

export const loginSchema = z.object({
  email: emailSchema,
  // Upper bound against a long-password DoS: extremely long input makes the
  // auth provider's hashing algorithm needlessly expensive to process.
  password: z
    .string()
    .min(8, "Wachtwoord moet minimaal 8 tekens zijn.")
    .max(128, "Wachtwoord mag maximaal 128 tekens zijn."),
});

export type LoginInput = z.infer<typeof loginSchema>;
