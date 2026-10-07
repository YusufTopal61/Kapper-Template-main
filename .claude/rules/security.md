---
paths:
  - "src/features/*/presentation/*.actions.ts"
  - "src/proxy.ts"
  - "src/lib/**"
  - "src/app/admin/**"
  - "next.config.ts"
---

# Security

- Server-side validation with the same Zod schema as the form. Never trust the client.
- Admin access is a chain: `proxy.ts` (session) → admin layout (is admin) → `assertAdmin` in the use case → RLS.
  Do not rely on hidden UI.
- Public forms: honeypot, rate limit (`limitRequests`), store first and mail afterwards (a mail failure never
  fails a booking), and a generic error for bots.
- Errors: use `lib/errors.ts`; log with `lib/logger.ts` (no `console.*`); only validation messages reach the user.
- Secrets only in env; never in the client bundle, git, logs or error messages. `NEXT_PUBLIC_` is public.
- Links in emails use `SITE_URL`, never the Host header. No open redirects. Escape anything put into
  `dangerouslySetInnerHTML` (JSON-LD uses `serializeJsonLd`).
- Security headers and the CSP live in `next.config.ts`; changing them needs a build and a browser check.
