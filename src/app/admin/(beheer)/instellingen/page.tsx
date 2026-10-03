import type { Metadata } from "next";
import { getSettingsDeps } from "@/app/di/container";
import { getAdminSettings } from "@/modules/settings/domain/usecases/getAdminSettings";
import { getEmailStatus } from "@/modules/settings/domain/usecases/getEmailStatus";
import { SettingsForm } from "@/modules/settings/presentation/SettingsForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Instellingen" };

export default async function InstellingenPagina() {
  const deps = getSettingsDeps();
  const [instellingen, emailStatus] = await Promise.all([
    getAdminSettings(deps),
    getEmailStatus(deps),
  ]);

  return <SettingsForm instellingen={instellingen} emailStatus={emailStatus} />;
}
