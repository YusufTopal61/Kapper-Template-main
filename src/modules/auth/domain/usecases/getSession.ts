import type { AuthGateway } from "../auth.gateway";

/** Wie is er aan de lijn, en mag die beheren? Voor de beheer-layout en de loginpagina. */
export function getSession(auth: Pick<AuthGateway, "getSession">) {
  return auth.getSession();
}
