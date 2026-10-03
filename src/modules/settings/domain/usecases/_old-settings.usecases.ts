import type { AdminGuard } from "@/modules/auth/domain/auth.gateway";
import type { SettingsInput } from "../domain/settings.schema";
import type { EmailStatusChecker, SettingsRepository } from "../domain/settings.repository";
import { naarAdminInstellingen, naarPubliekeInstellingen } from "../domain/settings.rules";

type Admin = { assertAdmin: AdminGuard };

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

export async function getAdminSettings(
  deps: Admin & { repo: Pick<SettingsRepository, "readAsAdmin"> },
) {
  await deps.assertAdmin();
  return naarAdminInstellingen(await deps.repo.readAsAdmin());
}

export async function saveSettings(
  deps: Admin & { repo: Pick<SettingsRepository, "save"> },
  input: SettingsInput,
) {
  await deps.assertAdmin();
  await deps.repo.save(input);
  return { ok: true as const };
}

export async function getEmailStatus(deps: Admin & { checker: EmailStatusChecker }) {
  await deps.assertAdmin();
  return deps.checker.check();
}
