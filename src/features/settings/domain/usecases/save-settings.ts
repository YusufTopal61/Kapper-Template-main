import type { AdminGuard } from "@/modules/auth/domain/auth.gateway";
import type { SettingsRepository } from "../settings.repository";
import type { SettingsInput } from "../settings.schema";

/** Beheer: bedrijfsgegevens en openingstijden opslaan. */
export async function saveSettings(
  deps: { assertAdmin: AdminGuard; repo: Pick<SettingsRepository, "save"> },
  input: SettingsInput,
) {
  await deps.assertAdmin();
  await deps.repo.save(input);
  return { ok: true as const };
}
