export type Weekday =
  "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";

export type DayOpeningHours = {
  open: boolean;
  from: string;
  to: string;
};

export type OpeningHours = Record<Weekday, DayOpeningHours>;

/** De bedrijfsgegevens van de zaak, zoals het domein ze kent. */
export type BusinessSettings = {
  businessName: string;
  adminEmail: string | null;
  phoneNumber: string | null;
  address: string | null;
  openingHours: OpeningHours;
};

/** Wat een bezoeker mag zien — bewust zonder admin_email. */
export type PublicSettings = Pick<
  BusinessSettings,
  "businessName" | "address" | "phoneNumber" | "openingHours"
>;

/** Wat het beheerformulier nodig heeft. */
export type AdminSettings = BusinessSettings & {
  /** Stuurt de prompt aan die vraagt om een notificatie-adres in te vullen. */
  emailConfigured: boolean;
};

export type EmailStatus = {
  /** Staat er een RESEND_API_KEY? Zonder key worden mails alleen gelogd. */
  configured: boolean;
  /**
   * true = Resend staat nog in testmodus: mails komen alleen aan bij het eigen
   * Resend-accountadres, niet bij echte klanten. De meest voorkomende manier
   * waarop "waterdichte" e-mail alsnog stil faalt.
   */
  sandboxMode: boolean;
  fromAddress: string;
  verifiedDomains: string[];
};
