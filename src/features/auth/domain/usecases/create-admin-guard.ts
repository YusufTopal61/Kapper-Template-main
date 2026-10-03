import { UnauthorizedError, type AdminGuard, type AuthGateway } from "../auth.gateway";

/**
 * De autorisatiebeslissing voor alle beheeracties. Dit is het tweede slot
 * bovenop Row Level Security: ook als deze check ooit vergeten wordt,
 * blokkeert de database de query alsnog.
 */
export function createAdminGuard(auth: Pick<AuthGateway, "isAdmin">): AdminGuard {
  return async () => {
    if (!(await auth.isAdmin())) throw new UnauthorizedError();
  };
}
