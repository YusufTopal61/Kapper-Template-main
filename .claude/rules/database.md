---
paths:
  - "supabase/**"
  - "src/features/*/data/**"
  - "src/lib/supabase/**"
---

# Database

- The live schema uses **Dutch** column names, enum values (`bevestigd`, …) and JSON keys (`maandag`,
  `van`, `tot`). Only `*.mapper.ts` knows them; entities are English camelCase. **Do not rename the schema.**
- Every schema change is a migration in `supabase/migrations/` (timestamp prefix). Never change the schema
  only in the dashboard. **Never apply a migration to the live project without asking.**
- RLS on every table, a policy per role. The service-role key is used only in `lib/supabase/admin.ts`,
  server-side, and only where access is secured another way (token, server-internal read).
- After a migration: update the mapper and its test, regenerate `database.types.ts` (`pnpm db:types`),
  keep `supabase/seed.sql` idempotent, and add a rollback note.
- Throw `DatabaseError` (with the original error as `cause`); never expose database messages to users.
- Booking integrity is enforced by the database (unique index on active time slots), not only by code.
