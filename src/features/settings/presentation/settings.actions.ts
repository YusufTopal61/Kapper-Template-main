"use server";

import { getSettingsDeps } from "@/lib/di/container";
import { invalidInput } from "@/lib/utils/action-result";
import { runAsAdmin } from "@/features/auth/presentation/admin-action";
import { settingsInputSchema } from "../domain/settings.schema";
import { saveSettings } from "../domain/usecases/save-settings";

export async function saveSettingsAction(input: unknown) {
  const valid = settingsInputSchema.safeParse(input);
  if (!valid.success) return invalidInput(valid.error);

  return runAsAdmin(() => saveSettings(getSettingsDeps(), valid.data));
}
