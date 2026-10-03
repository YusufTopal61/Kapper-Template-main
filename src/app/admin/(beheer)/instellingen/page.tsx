import type { Metadata } from "next";
import { getSettingsDeps } from "@/lib/di/container";
import { getAdminSettings } from "@/features/settings/domain/usecases/get-admin-settings";
import { getEmailStatus } from "@/features/settings/domain/usecases/get-email-status";
import { SettingsForm } from "@/features/settings/presentation/SettingsForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Instellingen" };

export default async function SettingsPage() {
  const deps = getSettingsDeps();
  const [settings, emailStatus] = await Promise.all([getAdminSettings(deps), getEmailStatus(deps)]);

  return <SettingsForm settings={settings} emailStatus={emailStatus} />;
}
