import { getAdminGuard } from "@/modules/auth/container.server";
import { createResendEmailStatusChecker } from "./data/email-status.server";
import { createSupabaseSettingsRepository } from "./data/settings.repository.server";

/** Composition root van de settings-module: hier worden de implementaties gekozen. */
export function getSettingsDeps() {
  return {
    repo: createSupabaseSettingsRepository(),
    checker: createResendEmailStatusChecker(),
    assertAdmin: getAdminGuard(),
  };
}
