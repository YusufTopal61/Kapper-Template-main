import type { ZodError } from "zod";

export type ActieFout = { ok: false; error: string };

/** Zet een Zod-fout om in één leesbare melding voor de gebruiker. */
export function ongeldigeInvoer(fout: ZodError): ActieFout {
  return { ok: false, error: fout.issues[0]?.message ?? "Controleer de ingevulde gegevens." };
}
