import { z } from "zod";
import { emailSchema } from "@/shared/domain/primitives";

export const loginSchema = z.object({
  email: emailSchema,
  // Bovengrens tegen een long-password DoS: extreem lange input maakt het
  // hash-algoritme van de auth-provider onnodig duur om te verwerken.
  password: z
    .string()
    .min(8, "Wachtwoord moet minimaal 8 tekens zijn.")
    .max(128, "Wachtwoord mag maximaal 128 tekens zijn."),
});

export type LoginInput = z.infer<typeof loginSchema>;
