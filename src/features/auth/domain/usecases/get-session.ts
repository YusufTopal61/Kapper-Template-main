import type { AuthGateway } from "../auth.gateway";

/** Who is on the line, and may they administer? For the admin layout and the login page. */
export function getSession(auth: Pick<AuthGateway, "getSession">) {
  return auth.getSession();
}
