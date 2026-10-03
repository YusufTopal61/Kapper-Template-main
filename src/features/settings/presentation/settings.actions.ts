"use server";

import { getSettingsDeps } from "@/lib/di/container";
import { invalidInput, runAction } from "@/lib/utils/action-result";
import { settingsInputSchema } from "../domain/settings.schema";
import { saveSettings } from "../domain/usecases/save-settings";

export async function saveSettingsAction(input: unknown) {
  const valid = settingsInputSchema.safeParse(input);
  if (!valid.success) return invalidInput(valid.error);

  return runAction(() => saveSettings(getSettingsDeps(), valid.data));
}
