import type { SettingsInput } from "./settings.schema";
import type { BusinessSettings, EmailStatus } from "./settings.entity";

/**
 * Poort naar de opslag van de bedrijfsgegevens. De implementatie staat in
 * data/; niets buiten data/ weet waar de gegevens vandaan komen.
 */
export interface SettingsRepository {
  /**
   * Volledige instellingen voor server-intern gebruik (mails, boekingsregels).
   * Leest buiten de beheerderssessie om: de publieke site heeft die ook nodig.
   */
  read(): Promise<BusinessSettings | null>;
  /** Idem, maar onder de rechten van de ingelogde beheerder. */
  readAsAdmin(): Promise<BusinessSettings | null>;
  save(input: SettingsInput): Promise<void>;
}

/** Poort naar de mailprovider: kan er daadwerkelijk naar klanten verstuurd worden? */
export interface EmailStatusChecker {
  check(): Promise<EmailStatus>;
}
