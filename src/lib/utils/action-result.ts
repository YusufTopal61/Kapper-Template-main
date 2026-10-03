import type { ZodError } from "zod";
import { AuthenticationError, AuthorizationError, ValidationError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import type { ActionError } from "@/types/action";

export const SESSION_EXPIRED = "Je sessie is verlopen. Log opnieuw in.";
export const GENERIC_ERROR = "Er ging iets mis. Probeer het zo nog eens.";

/** Turns a Zod error into one readable message for the user. */
export function invalidInput(error: ZodError): ActionError {
  return { ok: false, error: error.issues[0]?.message ?? "Controleer de ingevulde gegevens." };
}

/**
 * Maps any thrown error to a message that is safe to show:
 *   validation               → its own message (written for the user)
 *   authentication/authorization → "session expired" (does not reveal which)
 *   database / unexpected    → a generic message; details go to the server log only
 */
export function toActionError(error: unknown): ActionError {
  if (error instanceof AuthenticationError || error instanceof AuthorizationError) {
    return { ok: false, error: SESSION_EXPIRED };
  }
  if (error instanceof ValidationError) return { ok: false, error: error.message };

  logger.error("action", "unexpected error in a server action", error);
  return { ok: false, error: GENERIC_ERROR };
}

/** Runs a server action body and converts any thrown error into an ActionError. */
export async function runAction<T>(body: () => Promise<T>): Promise<T | ActionError> {
  try {
    return await body();
  } catch (error) {
    return toActionError(error);
  }
}
