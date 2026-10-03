import type { SettingsRepository } from "../settings.repository";
import { naarPubliekeInstellingen } from "../settings.rules";

/**
 * Instellingen voor publieke pagina's. De publieke site moet ook overeind
 * blijven als de database even onbereikbaar is: dan vallen we terug op defaults.
 */
export async function getPublicSettings(repo: Pick<SettingsRepository, "read">) {
  try {
    return naarPubliekeInstellingen(await repo.read());
  } catch (error) {
    console.error("[settings] publieke instellingen ophalen mislukt:", error);
    return naarPubliekeInstellingen(null);
  }
}
