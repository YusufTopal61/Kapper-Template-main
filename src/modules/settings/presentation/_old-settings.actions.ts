import { createServerFn } from "@tanstack/react-start";
import { settingsInputSchema } from "../domain/settings.schema";
import { getSettingsDeps } from "../container.server";
import {
  getAdminSettings,
  getEmailStatus,
  getPublicSettings,
  saveSettings,
} from "./settings.usecases";

export const fetchPublicSettings = createServerFn({ method: "GET" }).handler(() =>
  getPublicSettings(getSettingsDeps().repo),
);

export const fetchAdminSettings = createServerFn({ method: "GET" }).handler(() =>
  getAdminSettings(getSettingsDeps()),
);

export const fetchEmailStatus = createServerFn({ method: "GET" }).handler(() =>
  getEmailStatus(getSettingsDeps()),
);

export const saveAdminSettings = createServerFn({ method: "POST" })
  .inputValidator(settingsInputSchema)
  .handler(({ data }) => saveSettings(getSettingsDeps(), data));
