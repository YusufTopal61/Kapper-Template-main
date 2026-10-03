"use server";

import { getSettingsDeps } from "@/app/di/container";
import { ongeldigeInvoer } from "@/shared/lib/action-result";
import { uitvoerenAlsBeheerder } from "@/modules/auth/presentation/admin-action";
import { settingsInputSchema } from "../domain/settings.schema";
import { saveSettings } from "../domain/usecases/saveSettings";

export async function saveSettingsAction(input: unknown) {
  const geldig = settingsInputSchema.safeParse(input);
  if (!geldig.success) return ongeldigeInvoer(geldig.error);

  return uitvoerenAlsBeheerder(() => saveSettings(getSettingsDeps(), geldig.data));
}
