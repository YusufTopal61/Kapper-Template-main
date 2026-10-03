import type { ZodError } from "zod";

export type ActionError = { ok: false; error: string };

/** Zet een Zod-fout om in één leesbare melding voor de gebruiker. */
export function invalidInput(error: ZodError): ActionError {
  return { ok: false, error: error.issues[0]?.message ?? "Controleer de ingevulde gegevens." };
}
