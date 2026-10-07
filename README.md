# Kapper

A Dutch barbershop website with online booking, cancelling through a link in the
confirmation email, and an admin panel (calendar, services, settings). It is also
the reference implementation of the Yusuf Web Development Standard v1.0.

## Built by

Built and maintained by **YM Creations** — <https://ymcreations.com> ·
<contact@ymcreations.com> · +31 6 53 40 02 20 · KvK 96175354. The company details live in one
place, `builder` in `src/config/site.ts`; the footer credit and the help line in the admin panel
read from it.

## Overview

- **Visitors** browse the site, pick a service, day and time, and book without an account.
  They get a confirmation email with a personal cancel link.
- **The owner** signs in at `/admin` to see the agenda, manage services and opening hours,
  and receives an email for every new booking or cancellation.
- Brand name, texts, prices and opening hours are configurable; the project is a template.

## Deviations from the standard (with reasons)

| Standard                             | Here                                                                             | Reason                                                                                                                           |
| ------------------------------------ | -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| English everywhere                   | Dutch UI copy and Dutch URL slugs (`/boeken`, `/diensten`, …)                    | The site is for Dutch customers; Dutch slugs rank better for local search. Code, comments and docs are English.                  |
| `middleware.ts`                      | `src/proxy.ts`                                                                   | Next.js 16 renamed middleware to proxy. Same function.                                                                           |
| Server Actions only for writes       | `fetchAvailableSlots` is a Server Action that reads                              | Availability depends on a choice made in the browser (day + service); a Server Component cannot refetch it without a navigation. |
| `dashboard/` route                   | `/admin`                                                                         | "Admin" is already English and short; a rename would break links in emails.                                                      |
| `features/` is a flat folder         | Each feature has `domain/`, `data/`, `presentation/`                             | Keeps business rules testable without a database or browser. Enforced by ESLint.                                                 |
| `lib/` knows no features             | `lib/di/container.ts` wires features to their implementations                    | A composition root must see both sides. It is the only exception (ESLint).                                                       |
| `domain/` imports only Zod           | Also `lib/validations`, `lib/errors`, `lib/logger` and other features' `domain/` | Shared Zod primitives, the error classes and the logger are pure and framework-free.                                             |
| Strict CSP with a nonce              | CSP with `'unsafe-inline'` for scripts                                           | Next.js places hydration scripts inline. A nonce via `proxy.ts` is the next step.                                                |
| `noPropertyAccessFromIndexSignature` | Off                                                                              | Next.js only inlines `process.env.NEXT_PUBLIC_X` with dot access.                                                                |
| Zod 4                                | Zod 3.25                                                                         | Forms and resolvers are built on v3; migrating is a separate, tested step.                                                       |
| Resend not in the standard           | Used for email (via `fetch`, no package)                                         | Transactional email is functionally required. Without `RESEND_API_KEY` mails are logged, never fail.                             |
| Unit tests in `tests/`               | Next to the code (`*.test.ts`); E2E in `tests/e2e/`                              | Colocated tests are easier to find and keep in sync.                                                                             |

## Tech stack

TypeScript 5.9 · Next.js 16 (App Router, Turbopack) · React 19 · Tailwind CSS 4 · shadcn/ui ·
Supabase (Postgres, Auth, RLS) · Zod 3 · React Hook Form · Resend · Plausible (opt-in) ·
pnpm 10 · Vitest · Playwright · ESLint 9 · Prettier · GitHub Actions · Vercel.

## Requirements

- Node.js 22 (see `.nvmrc`; `nvm use`)
- pnpm 10 — enable it with `corepack enable` (the version comes from `packageManager`)
- A Supabase project (free tier works)
- Optional: a Resend account with a verified domain, to email real customers

## Installation

```bash
git clone <repo-url> && cd <repo>
corepack enable
pnpm install
cp .env.example .env.local   # then fill in the values
```

## Environment variables

See `.env.example`. They are validated with Zod: public ones in `src/lib/env.ts`, server ones
in `src/lib/env.server.ts`. In production the app refuses to start with a missing variable.

| Variable                                                           | Where       | Required                                                 |
| ------------------------------------------------------------------ | ----------- | -------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | public      | yes                                                      |
| `SUPABASE_SERVICE_ROLE_KEY`                                        | server only | yes                                                      |
| `SITE_URL`                                                         | server only | in production (canonical, sitemap, JSON-LD, email links) |
| `RESEND_API_KEY`, `RESEND_FROM`                                    | server only | no (without a key, mails are logged)                     |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`                                     | public      | no (analytics only after cookie consent)                 |
| `E2E_ADMIN_EMAIL`, `E2E_ADMIN_PASSWORD`                            | tests only  | no (admin E2E test is skipped without them)              |

Secrets never go in the repo (`.env*` is git-ignored except `.env.example`) and never in the client bundle.

## Development

```bash
pnpm dev            # http://localhost:3000
pnpm lint           # Next.js rules + architecture boundaries
pnpm format         # prettier --write   (format:check in CI)
pnpm typecheck      # strict TypeScript
```

## Database setup

All schema changes live in `supabase/migrations/` — never edit the schema only in the dashboard.

```bash
pnpm exec supabase login
pnpm exec supabase link --project-ref <your-project-ref>
pnpm db:migrate          # apply pending migrations
pnpm db:types            # regenerate src/lib/supabase/database.types.ts from the live schema
```

Local development with Docker: `pnpm exec supabase start`, then `pnpm exec supabase db reset`
applies the migrations and `supabase/seed.sql`.

**Existing project whose migrations were run by hand in the SQL editor:** mark them as applied once,
then future migrations can be pushed normally:

```bash
pnpm exec supabase migration repair --status applied 20260918000001 20260918000002 20260918000003
```

The schema uses Dutch column names and enum values. The mappers in `src/features/*/data/*.mapper.ts`
translate them to the English entities (and have unit tests), so a schema change touches only a
mapper and a migration. After any migration, run `pnpm db:types`.

Create the first admin: add a user in Supabase Auth, then
`insert into public.admin_users (user_id, email) values ('<auth user id>', '<email>');`.

## Testing

```bash
pnpm test            # Vitest: domain rules, use cases, schemas, SEO builders (no database, no browser)
pnpm test:e2e        # Playwright: public pages, booking flow, admin access
```

E2E uses your installed Google Chrome locally (no download) and Chromium in CI. The booking flow
writes (and cancels) a booking in the database configured in `.env.local`. The GitHub workflow
`E2E` runs it on demand with repository secrets.

## Build

```bash
pnpm build && pnpm start
```

## Deployment

Vercel, connected to the GitHub repository. Set the same environment variables per environment
(Preview and Production), with `SITE_URL` set to the real domain. DNS at the domain registrar points
to Vercel. CI (`.github/workflows/ci.yml`) runs install → lint → format check → typecheck → test → build
on every pull request; a PR that fails these is not production-ready.

## Project structure

See `CLAUDE.md` for the full layout and the architecture rules. In short:

```
src/app            routes          src/features/<name>/{domain,data,presentation}
src/components     ui, layout      src/lib            infrastructure and tooling
src/hooks          shared hooks    src/config         site and navigation config
supabase/          migrations, seed.sql, config.toml     tests/e2e   Playwright
```

## Open points

- Verify a domain in Resend; without it customers do not receive mail (the admin panel shows a warning).
- Set `SITE_URL` to the real domain and submit the sitemap in Search Console.
- The booking form has a honeypot field. Stronger bot protection (Turnstile), Sentry, the Vercel link and
  redirects and a nonce-based CSP are not in place yet.
- Cookie consent is versioned and expires after about six months (`src/lib/utils/consent.ts`). Bump
  `CONSENT_VERSION` when the purposes or the privacy policy change.
- The privacy policy and terms are example texts: the pages are `noindex` and out of the sitemap until the owner
  or a lawyer has approved them. Then remove `noIndex` from both pages and add them to `sitemapPages`.
- The testimonials section stays hidden until real reviews are added to `src/config/testimonials.ts`.
- Mark `RESEND_API_KEY` and `SUPABASE_SERVICE_ROLE_KEY` as sensitive in Vercel. Decide how long bookings are kept
  and write it in the privacy policy.
- `E2E_PORT` runs Playwright on another port when 3000 is taken.
- Rate limiting is in-memory (per instance). Before going live on serverless, move it to shared storage
  (a Supabase table or Upstash).
- The seed services have price 0 ("not set"); fill them in under `/admin/diensten`.
- Rotate any key that was ever pasted into a chat or ticket.
