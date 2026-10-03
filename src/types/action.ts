/** What a server action returns when something went wrong. The message is always safe to show. */
export type ActionError = { ok: false; error: string };
