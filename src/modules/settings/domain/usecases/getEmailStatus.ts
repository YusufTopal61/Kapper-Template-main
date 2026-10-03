import type { AdminGuard } from "@/modules/auth/domain/auth.gateway";
import type { EmailStatusChecker } from "../settings.repository";

/** Beheer: kunnen we daadwerkelijk naar klanten mailen, of staat de provider nog in testmodus? */
export async function getEmailStatus(deps: {
  assertAdmin: AdminGuard;
  checker: EmailStatusChecker;
}) {
  await deps.assertAdmin();
  return deps.checker.check();
}
