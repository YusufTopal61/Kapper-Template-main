import type { AdminGuard } from "@/modules/auth/domain/auth.gateway";
import type { SettingsRepository } from "../settings.repository";
import { naarAdminInstellingen } from "../settings.rules";

/** Beheer: de volledige instellingen, inclusief het notificatie-adres. */
export async function getAdminSettings(deps: {
  assertAdmin: AdminGuard;
  repo: Pick<SettingsRepository, "readAsAdmin">;
}) {
  await deps.assertAdmin();
  return naarAdminInstellingen(await deps.repo.readAsAdmin());
}
