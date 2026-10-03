export type SessieStatus = {
  ingelogd: boolean;
  email: string | null;
  /** Ingelogd, maar niet als beheerder aangemerkt. */
  geenBeheerder: boolean;
  supabaseGeconfigureerd: boolean;
};

/** Uitkomst van een inlogpoging, zonder dat de aanroeper iets van de provider hoeft te weten. */
export type SignInOutcome =
  { status: "ok"; email: string } | { status: "ongeldige-gegevens" } | { status: "geen-beheerder" };
