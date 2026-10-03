import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getAuthGateway, getSettingsDeps } from "@/lib/di/container";
import { AdminShell } from "@/features/admin/presentation/AdminShell";
import { AuthenticationError, AuthorizationError } from "@/lib/errors";
import { getSession } from "@/features/auth/domain/usecases/get-session";
import { getAdminSettings } from "@/features/settings/domain/usecases/get-admin-settings";
import { getEmailStatus } from "@/features/settings/domain/usecases/get-email-status";

export const dynamic = "force-dynamic";

/**
 * Second lock for everything under /admin (the first is proxy.ts): is there a
 * session, and is that user registered as an admin? This is the UX layer;
 * the real enforcement lives in the use cases (assertAdmin) and in RLS.
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
    if (error instanceof AuthenticationError || error instanceof AuthorizationError) {
      redirect("/admin/login");
    }
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
