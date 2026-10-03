import type { AdminGuard } from "@/features/auth/domain/auth.gateway";
import type { EmailStatusChecker } from "../settings.repository";

/** Admin: can we actually mail customers, or is the provider still in test mode? */
export async function getEmailStatus(deps: {
  assertAdmin: AdminGuard;
  checker: EmailStatusChecker;
}) {
  await deps.assertAdmin();
  return deps.checker.check();
}
