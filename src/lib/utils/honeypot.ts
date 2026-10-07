/**
 * Name of the hidden decoy field in public forms. Real visitors never see or
 * fill it; bots that fill every input do. The name looks like something worth
 * filling in on purpose.
 */
export const HONEYPOT_FIELD = "website";

/** True when the decoy field was filled in, so the submission came from a bot. */
export function isHoneypotTripped(input: unknown): boolean {
  if (typeof input !== "object" || input === null) return false;
  const value = (input as Record<string, unknown>)[HONEYPOT_FIELD];
  return typeof value === "string" && value.trim().length > 0;
}
