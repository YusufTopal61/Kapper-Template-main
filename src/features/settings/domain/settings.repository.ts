import type { SettingsInput } from "./settings.schema";
import type { BusinessSettings, EmailStatus } from "./settings.entity";

/**
 * Port to the storage of the business details. The implementation lives in
 * data/; nothing outside data/ knows where the data comes from.
 */
export interface SettingsRepository {
  /**
   * Full settings for server-internal use (mails, booking rules).
   * Reads outside the admin session: the public site needs them too.
   */
  read(): Promise<BusinessSettings | null>;
  /** Same, but under the signed-in admin's permissions. */
  readAsAdmin(): Promise<BusinessSettings | null>;
  save(input: SettingsInput): Promise<void>;
}

/** Port to the mail provider: can mail actually be sent to customers? */
export interface EmailStatusChecker {
  check(): Promise<EmailStatus>;
}
