import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getAuthGateway, getSettingsDeps } from "@/app/di/container";
import { AdminShell } from "@/modules/admin/presentation/AdminShell";
import { NietIngelogdError } from "@/modules/auth/domain/auth.gateway";
import { getSession } from "@/modules/auth/domain/usecases/getSession";
import { getAdminSettings } from "@/modules/settings/domain/usecases/getAdminSettings";
import { getEmailStatus } from "@/modules/settings/domain/usecases/getEmailStatus";

export const dynamic = "force-dynamic";

/**
 * Tweede slot voor alles onder /admin (het eerste is proxy.ts): is er een
 * sessie, en is die gebruiker ook als beheerder geregistreerd? Dit is de
 * UX-laag; de echte afdwinging zit in de use cases (assertAdmin) en in RLS.
 */
export default async function BeheerLayout({ children }: { children: ReactNode }) {
  const sessie = await getSession(getAuthGateway());
  if (!sessie.ingelogd) redirect("/admin/login");

  const deps = getSettingsDeps();
  let instellingen;
  let emailStatus;
  try {
    [instellingen, emailStatus] = await Promise.all([getAdminSettings(deps), getEmailStatus(deps)]);
  } catch (error) {
    if (error instanceof NietIngelogdError) redirect("/admin/login");
    throw error;
  }

  return (
    <AdminShell
      email={sessie.email}
      emailIngesteld={instellingen.emailIngesteld}
      emailSandbox={emailStatus.sandboxModus}
    >
      {children}
    </AdminShell>
  );
}
