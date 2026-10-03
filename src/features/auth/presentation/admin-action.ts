import "server-only";
import { UnauthorizedError } from "../domain/auth.gateway";

export const SESSION_EXPIRED = "Je sessie is verlopen. Log opnieuw in.";

/**
 * Voert een beheeractie uit en vertaalt "niet ingelogd" naar een nette
 * melding in plaats van een crash. De echte afdwinging zit in de use case
 * (assertAdmin) en in Row Level Security; dit is alleen de vertaling naar de UI.
 */
export async function runAsAdmin<T>(
  action: () => Promise<T>,
): Promise<T | { ok: false; error: string }> {
  try {
    return await action();
  } catch (error) {
    if (error instanceof UnauthorizedError) return { ok: false, error: SESSION_EXPIRED };
    throw error;
  }
}
