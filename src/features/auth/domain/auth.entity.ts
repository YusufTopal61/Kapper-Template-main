export type SessionStatus = {
  signedIn: boolean;
  email: string | null;
  /** Signed in, but not marked as an admin. */
  notAdmin: boolean;
  supabaseConfigured: boolean;
};

/** Outcome of a sign-in attempt, without the caller needing to know anything about the provider. */
export type SignInOutcome =
  { status: "ok"; email: string } | { status: "invalid-credentials" } | { status: "not-admin" };
