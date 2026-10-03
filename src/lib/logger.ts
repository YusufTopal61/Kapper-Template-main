/* eslint-disable no-console -- this is the one place that is allowed to write to the console. */

type Context = Record<string, unknown>;

/** Turns anything that was thrown into a plain, loggable object. */
function describeError(error: unknown): Context {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
      ...(error.cause !== undefined && { cause: describeError(error.cause) }),
    };
  }
  // Supabase errors are plain objects with message, code and details.
  if (typeof error === "object" && error !== null) return { ...error };
  return { value: String(error) };
}

/**
 * Structured logging with one format for the whole app, and one hook point for
 * an error tracker (Sentry) later. Log details here; show users a generic
 * message — never the other way around.
 */
export const logger = {
  info(scope: string, message: string, context?: Context) {
    console.info(`[${scope}] ${message}`, context ?? "");
  },

  warn(scope: string, message: string, context?: Context) {
    console.warn(`[${scope}] ${message}`, context ?? "");
  },

  error(scope: string, message: string, error?: unknown, context?: Context) {
    console.error(`[${scope}] ${message}`, {
      ...context,
      ...(error !== undefined && { error: describeError(error) }),
    });
  },
};
