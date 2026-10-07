/**
 * Pure rules for the cookie-consent choice: what is stored, when it expires and
 * when it must be asked again. No browser APIs here, so it is unit tested.
 *
 * Bump CONSENT_VERSION whenever the purposes or the privacy policy change in a
 * way that needs a fresh choice from every visitor.
 */
export const CONSENT_VERSION = 1;

/** A choice is asked again after about six months. */
export const CONSENT_MAX_AGE_DAYS = 182;

export type ConsentChoice = "accepted" | "declined";
export type ConsentStatus = ConsentChoice | "unknown";

type StoredConsent = {
  status: ConsentChoice;
  version: number;
  /** Unix time in milliseconds. */
  savedAt: number;
};

const DAY_MS = 24 * 60 * 60 * 1000;

export function serializeConsent(choice: ConsentChoice, now: Date): string {
  const stored: StoredConsent = {
    status: choice,
    version: CONSENT_VERSION,
    savedAt: now.getTime(),
  };
  return JSON.stringify(stored);
}

function isStoredConsent(value: unknown): value is StoredConsent {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return (
    (candidate["status"] === "accepted" || candidate["status"] === "declined") &&
    typeof candidate["version"] === "number" &&
    typeof candidate["savedAt"] === "number"
  );
}

/**
 * Reads a stored value. Anything missing, malformed, from an older version,
 * expired or dated in the future counts as "unknown", so the visitor is asked
 * again. Values from before versioning (a bare "accepted") are also unknown.
 */
export function parseConsent(raw: string | null, now: Date): ConsentStatus {
  if (!raw) return "unknown";

  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return "unknown";
  }

  if (!isStoredConsent(value)) return "unknown";
  if (value.version !== CONSENT_VERSION) return "unknown";

  const age = now.getTime() - value.savedAt;
  if (age < 0 || age > CONSENT_MAX_AGE_DAYS * DAY_MS) return "unknown";

  return value.status;
}
