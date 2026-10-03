import type { SessionStatus, SignInOutcome } from "./auth.entity";

/** Where a visitor stands: nobody, somebody without admin rights, or an admin. */
export type AdminStatus = "signed-out" | "not-admin" | "admin";

/** Port to the authentication provider. */
export interface AuthGateway {
  getSession(): Promise<SessionStatus>;
  signIn(email: string, password: string): Promise<SignInOutcome>;
  signOut(): Promise<void>;
  /** Authentication ("who are you?") and authorization ("may you?") in one answer. */
  getAdminStatus(): Promise<AdminStatus>;
}

/** The enforceable variant of getAdminStatus: throws unless an admin is on the line. */
export type AdminGuard = () => Promise<void>;
