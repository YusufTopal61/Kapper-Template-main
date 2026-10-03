export type SessionStatus = {
  signedIn: boolean;
  email: string | null;
  /** Ingelogd, maar niet als beheerder aangemerkt. */
  notAdmin: boolean;
  supabaseConfigured: boolean;
};

/** Uitkomst van een inlogpoging, zonder dat de aanroeper iets van de provider hoeft te weten. */
export type SignInOutcome =
  { status: "ok"; email: string } | { status: "invalid-credentials" } | { status: "not-admin" };
