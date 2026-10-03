# CLAUDE.md — project standard

This file is loaded automatically. It is the single source of truth for how this
repository is built. It combines the **Yusuf Web Development Standard v1.0**
(stack, tooling, conventions) with the **four-layer architecture** used inside
each feature. Where the two overlap, v1.0 wins.

I build professional websites for local businesses. Treat this as a site that has
to bring in customers, not as a hobby project: production code, error handling,
types and edge cases. No demo code, no `any`.

## How to work

- Explain briefly _why_ something must be this way, not only what to do.
- Give the full file path and whole files. Say which layer something belongs to
  before writing it. Warn when a solution breaks the layer separation, even if asked.
- Do not claim something works without checking it: `pnpm lint`, `pnpm typecheck`,
  `pnpm test`, `pnpm build` (and `pnpm test:e2e` for flows).
- Prefer a refactor over a rebuild. Do not add a dependency without a clear need.
- Work on a branch (`feature/…`, `fix/…`, `refactor/…`), never directly on `main`.
  Conventional commits: `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`, `test:`.
- Ask before running any database migration against a real project.

## Language

- **Code is English**: identifiers, comments, commit messages, docs, test titles,
  log and developer error messages.
- **User-facing copy is Dutch** (the sites are for Dutch businesses): UI text,
  validation messages, emails, metadata. It lives in presentation, in domain
  messages, and in `data/mail-templates.ts` — never in identifiers.
- **URL slugs stay Dutch** (`/boeken`, `/diensten`, …) for local SEO. This is the one
  place Dutch appears in folder names under `src/app/`.

## Stack (fixed; no alternatives without a technical reason)

TypeScript (strict) · Next.js (App Router) · React · Tailwind CSS · shadcn/ui ·
Supabase (Postgres, Auth, Storage) · Zod · React Hook Form · pnpm · Node LTS ·
Prettier · ESLint · Vitest · Playwright · GitHub · Vercel · Supabase CLI migrations.

Versions are pinned (exact) in `package.json`; Node in `.nvmrc`; pnpm via
`packageManager`. The dev server runs on **http://localhost:3000**.

## Structure

```
src/
  app/                 routing only: pages, layouts, route handlers, sitemap/robots
  components/
    ui/                shadcn components (design system)
    layout/            Navbar, Footer, banners, providers
    shared/            reusable components used by several features
  features/<name>/     feature code, split into four layers (below)
  lib/
    supabase/          server/admin clients, generated database.types.ts
    utils/             small single-purpose helpers (cn, clock, rate limit, …)
    validations/       shared Zod building blocks
    seo/               metadata helper, JSON-LD builders
    di/container.ts    composition root (the only place that wires data to domain)
    env.ts, env.server.ts, errors.ts, logger.ts
  hooks/               hooks used by several components
  types/               shared TypeScript types
  config/              site and navigation config
  proxy.ts             first lock for /admin (Next.js 16 name for middleware)
  instrumentation.ts   validates the environment at startup
supabase/              migrations/, seed.sql, config.toml, rollback/
tests/e2e/             Playwright tests
```

Avoid giant `utils.ts` / `components.tsx` files. Components: `PascalCase.tsx`.
Everything else: `kebab-case` (e.g. `use-booking-wizard.ts`). Functions and
variables: `camelCase`. Database: `snake_case`. Env vars: `SCREAMING_SNAKE_CASE`.

## Architecture: four layers per feature

Imports point inward; a layer may never be skipped. ESLint enforces this
(`eslint.config.mjs`), so a violation fails `pnpm lint`.

| Layer           | Contains                                                                                                 | May import                                                                            | Never                    |
| --------------- | -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | ------------------------ |
| `presentation/` | view models (`use-*.ts`), UI models (`*.ui-model.ts`), server actions (`*.actions.ts`), components       | domain, `components/`, `hooks/`, `lib/utils`                                          | Supabase or `data/`      |
| `domain/`       | entities, Zod schemas, rules (`*.rules.ts`), use cases (`usecases/`), repository interfaces              | zod, itself, other features' `domain/`, `lib/validations`, `lib/errors`, `lib/logger` | anything else            |
| `data/`         | repository implementations (`*.supabase.ts`), external services (`*.resend.ts`), mappers (`*.mapper.ts`) | domain, `lib/`                                                                        | React or `presentation/` |

- Only mappers know database column names. Entities are camelCase; rows are snake_case.
- A server action validates with Zod, rate limits, and calls **one** use case through
  `lib/di/container.ts`. No business logic in components or actions.
- Read data in Server Components (the page calls a use case via the container);
  write through Server Actions. No React Query or global state unless proven necessary.
- Is a business rule in a `.tsx` file? Move it to `domain/*.rules.ts` and test it.

## Errors

Use the taxonomy in `lib/errors.ts`: `ValidationError`, `AuthenticationError`,
`AuthorizationError`, `DatabaseError`, unexpected. Log with `lib/logger.ts` — never
`console.*` (ESLint forbids it). Only validation messages reach the user; everything
else is logged on the server and replaced by a generic message (`toActionError`).

## Security (checked on every change)

RLS on every table with a policy per role · authorization enforced server-side
(`proxy.ts` → admin layout → `assertAdmin` in the use case → RLS) · the service-role
key only in `lib/supabase/admin.ts` · server-side validation with the same Zod schema
as the form · rate limiting on public forms · secrets never in the client bundle ·
no `dangerouslySetInnerHTML` without escaping · `SITE_URL`, not the Host header, for
links in emails. Database changes only through migrations in `supabase/migrations/`.

## SEO and performance

`buildMetadata` per route (canonical, Open Graph, Twitter) · JSON-LD from `lib/seo` ·
generated `sitemap.ts` / `robots.ts` · semantic HTML, one `h1` per page, server-rendered
content · mobile first (375 px), LCP < 2.5 s, CLS < 0.1 · `'use client'` as deep as possible.

## Definition of done

`pnpm lint` · `pnpm format:check` · `pnpm typecheck` · `pnpm test` · `pnpm build` all pass,
and the changed flow works in the browser. CI runs the same checks.
