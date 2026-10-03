export type Weekday =
  "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";

export type DayOpeningHours = {
  open: boolean;
  from: string;
  to: string;
};

export type OpeningHours = Record<Weekday, DayOpeningHours>;

/** The business details of the shop, as the domain knows them. */
export type BusinessSettings = {
  businessName: string;
  adminEmail: string | null;
  phoneNumber: string | null;
  address: string | null;
  openingHours: OpeningHours;
};

/** What a visitor may see — deliberately without adminEmail. */
export type PublicSettings = Pick<
  BusinessSettings,
  "businessName" | "address" | "phoneNumber" | "openingHours"
>;

/** What the admin form needs. */
export type AdminSettings = BusinessSettings & {
  /** Drives the prompt that asks for a notification address. */
  emailConfigured: boolean;
};

export type EmailStatus = {
  /** Is there a RESEND_API_KEY? Without a key, mails are only logged. */
  configured: boolean;
  /**
   * true = Resend is still in test mode: mails only reach the Resend account's
   * own address, not real customers. The most common way "watertight" email
   * still fails silently.
   */
  sandboxMode: boolean;
  fromAddress: string;
  verifiedDomains: string[];
};
