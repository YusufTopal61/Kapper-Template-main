# CLAUDE.md — project standard

Website for a local business, built by YM Creations to the **Yusuf Web Development Standard v1.0**.
Treat it as a site that has to bring in customers: production code, error handling, types, edge cases.
No demo code, no `any`. Keep this file short; detail lives in `.claude/rules/` (loaded per area) and
`.claude/skills/` (procedures).

## Working agreement

- Explain briefly _why_, not only what. Give full file paths. Say which layer something belongs to
  before writing it. Warn when a solution breaks the layer separation, even if asked.
- Never claim something works without running the check (see Definition of done).
- Prefer a refactor over a rebuild. No new dependency without a clear need.
- Branch for non-trivial work (`feature/…`, `fix/…`, `refactor/…`); conventional commits.
- Ask before running a migration on a real project, deleting data, or touching secrets.

## Language

Code, comments, tests, docs and commit messages are **English**. User-facing copy (UI text,
validation messages, emails, metadata) is **Dutch**, and URL slugs stay Dutch (`/boeken`, `/diensten`).

## Stack (fixed)

TypeScript strict · Next.js App Router · React · Tailwind · shadcn/ui · Supabase (Postgres, Auth, RLS) ·
Zod · React Hook Form · Resend · pnpm · Vitest · Playwright · Vercel. Versions pinned in `package.json`,
Node in `.nvmrc`. Dev server: http://localhost:3000.

## Structure

```
src/app            routing only          src/components/{ui,layout}   shared UI
src/features/<n>/{domain,data,presentation}   feature code, four layers
src/lib            infra (supabase, utils, seo, validations, di, errors, logger, env)
src/hooks · src/types · src/config            supabase/ migrations, seed.sql   tests/e2e
```

Components `PascalCase.tsx`; everything else `kebab-case`; variables `camelCase`; DB `snake_case`.
Imports point inward; ESLint enforces the layers (`pnpm lint` fails on a violation).

## Rules and skills

Path-scoped rules load automatically: `architecture`, `database`, `security`, `frontend-and-copy`,
`privacy-and-tracking`, `testing`, `workflow`. Procedures: `/new-feature`, `/database-change`, `/verify`.

## Definition of done

`pnpm lint` · `pnpm format:check` · `pnpm typecheck` · `pnpm test` · `pnpm build` pass, and the changed
flow works in the browser (`pnpm test:e2e` for booking/admin flows). CI runs the same checks.
Report evidence: the command, its result, and any remaining risk.
