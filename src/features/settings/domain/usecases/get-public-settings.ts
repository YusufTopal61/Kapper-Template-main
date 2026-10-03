import { logger } from "@/lib/logger";
import type { SettingsRepository } from "../settings.repository";
import { toPublicSettings } from "../settings.rules";

/**
 * Settings for public pages. The public site must also stay up when the
 * database is briefly unreachable: then we fall back to defaults.
 */
export async function getPublicSettings(repo: Pick<SettingsRepository, "read">) {
  try {
    return toPublicSettings(await repo.read());
  } catch (error) {
    logger.error("settings", "fetching public settings failed, using defaults", error);
    return toPublicSettings(null);
  }
}
