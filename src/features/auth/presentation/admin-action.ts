import "server-only";
import { NietIngelogdError } from "../domain/auth.gateway";

export const SESSIE_VERLOPEN = "Je sessie is verlopen. Log opnieuw in.";

/**
 * Voert een beheeractie uit en vertaalt "niet ingelogd" naar een nette
 * melding in plaats van een crash. De echte afdwinging zit in de use case
 * (assertAdmin) en in Row Level Security; dit is alleen de vertaling naar de UI.
 */
export async function uitvoerenAlsBeheerder<T>(
  actie: () => Promise<T>,
): Promise<T | { ok: false; error: string }> {
  try {
    return await actie();
  } catch (error) {
    if (error instanceof NietIngelogdError) return { ok: false, error: SESSIE_VERLOPEN };
    throw error;
  }
}
