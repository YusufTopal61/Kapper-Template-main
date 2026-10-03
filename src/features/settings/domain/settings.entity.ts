export type Dag =
  "maandag" | "dinsdag" | "woensdag" | "donderdag" | "vrijdag" | "zaterdag" | "zondag";

export type DagOpeningstijd = {
  open: boolean;
  van: string;
  tot: string;
};

export type Openingstijden = Record<Dag, DagOpeningstijd>;

/** De bedrijfsgegevens van de zaak, zoals het domein ze kent. */
export type BusinessSettings = {
  bedrijfsnaam: string;
  admin_email: string | null;
  telefoonnummer: string | null;
  adres: string | null;
  openingstijden: Openingstijden;
};

/** Wat een bezoeker mag zien — bewust zonder admin_email. */
export type PubliekeInstellingen = Pick<
  BusinessSettings,
  "bedrijfsnaam" | "adres" | "telefoonnummer" | "openingstijden"
>;

/** Wat het beheerformulier nodig heeft. */
export type AdminInstellingen = BusinessSettings & {
  /** Stuurt de prompt aan die vraagt om een notificatie-adres in te vullen. */
  emailIngesteld: boolean;
};

export type EmailStatus = {
  /** Staat er een RESEND_API_KEY? Zonder key worden mails alleen gelogd. */
  geconfigureerd: boolean;
  /**
   * true = Resend staat nog in testmodus: mails komen alleen aan bij het eigen
   * Resend-accountadres, niet bij echte klanten. De meest voorkomende manier
   * waarop "waterdichte" e-mail alsnog stil faalt.
   */
  sandboxModus: boolean;
  vanAdres: string;
  geverifieerdeDomeinen: string[];
};
