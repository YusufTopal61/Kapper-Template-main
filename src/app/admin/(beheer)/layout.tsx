import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getAuthGateway, getSettingsDeps } from "@/lib/di/container";
import { AdminShell } from "@/features/admin/presentation/AdminShell";
import { UnauthorizedError } from "@/features/auth/domain/auth.gateway";
import { getSession } from "@/features/auth/domain/usecases/get-session";
import { getAdminSettings } from "@/features/settings/domain/usecases/get-admin-settings";
import { getEmailStatus } from "@/features/settings/domain/usecases/get-email-status";

export const dynamic = "force-dynamic";

/**
 * Tweede slot voor alles onder /admin (het eerste is proxy.ts): is er een
 * sessie, en is die gebruiker ook als beheerder geregistreerd? Dit is de
 * UX-laag; de echte afdwinging zit in de use cases (assertAdmin) en in RLS.
 */
export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getSession(getAuthGateway());
  if (!session.signedIn) redirect("/admin/login");

  const deps = getSettingsDeps();
  let settings;
  let emailStatus;
  try {
    [settings, emailStatus] = await Promise.all([getAdminSettings(deps), getEmailStatus(deps)]);
  } catch (error) {
    if (error instanceof UnauthorizedError) redirect("/admin/login");
    throw error;
  }

  return (
    <AdminShell
      email={session.email}
      emailConfigured={settings.emailConfigured}
      emailSandbox={emailStatus.sandboxMode}
    >
      {children}
    </AdminShell>
  );
}
