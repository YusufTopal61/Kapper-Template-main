import { AuthenticationError, AuthorizationError } from "@/lib/errors";
import type { AdminGuard, AuthGateway } from "../auth.gateway";

/**
 * The authorization decision for all admin actions. This is the second lock
 * on top of Row Level Security: even if this check is ever forgotten, the
 * database still blocks the query.
 *
 * Not signed in is an authentication failure; signed in without admin rights
 * is an authorization failure. They are different errors on purpose.
 */
export function createAdminGuard(auth: Pick<AuthGateway, "getAdminStatus">): AdminGuard {
  return async () => {
    const status = await auth.getAdminStatus();
    if (status === "signed-out") throw new AuthenticationError();
    if (status === "not-admin") throw new AuthorizationError();
  };
}
