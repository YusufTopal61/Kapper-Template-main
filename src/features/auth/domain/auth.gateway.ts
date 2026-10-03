import type { SessionStatus, SignInOutcome } from "./auth.entity";

/** Poort naar de authenticatieprovider. */
export interface AuthGateway {
  getSession(): Promise<SessionStatus>;
  signIn(email: string, password: string): Promise<SignInOutcome>;
  signOut(): Promise<void>;
  /** Is er een sessie én staat die gebruiker als beheerder geregistreerd? */
  isAdmin(): Promise<boolean>;
}

/** De afdwingbare variant van isAdmin: gooit als er geen beheerder aan de lijn is. */
export type AdminGuard = () => Promise<void>;

export class UnauthorizedError extends Error {
  constructor() {
    super("NIET_INGELOGD");
    this.name = "NietIngelogdError";
  }
}
