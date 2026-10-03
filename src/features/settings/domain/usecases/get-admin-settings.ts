import type { AdminGuard } from "@/features/auth/domain/auth.gateway";
import type { SettingsRepository } from "../settings.repository";
import { toAdminSettings } from "../settings.rules";

/** Admin: the full settings, including the notification address. */
export async function getAdminSettings(deps: {
  assertAdmin: AdminGuard;
  repo: Pick<SettingsRepository, "readAsAdmin">;
}) {
  await deps.assertAdmin();
  return toAdminSettings(await deps.repo.readAsAdmin());
}
