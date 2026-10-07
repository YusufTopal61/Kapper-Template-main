---
name: database-change
description: Procedure for any Supabase schema change (new table, column, policy, index). Use before writing or applying a migration.
---

# Database change

1. Write `supabase/migrations/<yyyymmddhhmmss>_<name>.sql`. Include RLS (`enable row level security` and a
   policy per role) for every new table, and keep it reversible where possible (`supabase/rollback/`).
2. Keep the Dutch live naming for existing tables; new tables follow the project naming (see `database` rule).
3. Update the mapper in `src/features/<n>/data/` and its test; keep `seed.sql` idempotent.
4. **Do not apply it to the live project yourself.** Show the user the SQL and ask. They run it in the SQL
   editor or with `pnpm db:migrate`.
5. After it is applied: `pnpm db:types`, then `pnpm typecheck && pnpm test`, then a live check in the browser.
6. If production data could be lost or locked, say so explicitly and propose a backup first.
