/**
 * Error taxonomy. Every error that crosses a layer boundary is one of these, so
 * callers can decide what to do without string-matching messages:
 *
 *   validation      — the user's input is wrong; the message is safe to show.
 *   authentication  — "who are you?" failed (no valid session).
 *   authorization   — "what may you do?" failed (signed in, but not allowed).
 *   database        — a storage operation failed; never shown to users.
 *   unexpected      — anything else (a bug); never shown to users.
 *
 * Only `validation` messages may reach the screen. The rest are logged on the
 * server and replaced by a generic message (see toActionError).
 */
export type ErrorKind =
  "validation" | "authentication" | "authorization" | "database" | "unexpected";

export class AppError extends Error {
  readonly kind: ErrorKind;

  constructor(kind: ErrorKind, message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = new.target.name;
    this.kind = kind;
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super("validation", message);
  }
}

/** No valid session. */
export class AuthenticationError extends AppError {
  constructor() {
    super("authentication", "Not authenticated");
  }
}

/** Signed in, but not allowed to do this. */
export class AuthorizationError extends AppError {
  constructor() {
    super("authorization", "Not authorized");
  }
}

/**
 * A storage operation failed. The original error (with the database's own
 * message and code) is kept as `cause` for the server log and nowhere else.
 */
export class DatabaseError extends AppError {
  constructor(operation: string, cause: unknown) {
    super("database", `Database operation failed: ${operation}`, { cause });
  }
}
