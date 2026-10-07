---
name: new-feature
description: Scaffold a new feature under src/features/<name> with the four layers (domain, data, presentation), its use cases, mapper, actions and tests. Use when adding a new domain such as a new entity with its own screens.
---

# New feature

1. **Domain first.** In `src/features/<name>/domain/`: `<name>.entity.ts`, `<name>.schema.ts` (Zod),
   `<name>.rules.ts` (pure functions), `<name>.repository.ts` (interface), `usecases/<verb-noun>.ts`
   (one operation per file; dependencies passed in). Write the rules and use-case tests now
   (`*.test.ts`, in-memory fakes).
2. **Data.** `data/<name>.mapper.ts` (the only place with column names), `data/<name>.supabase.ts`
   (`import "server-only"`, throw `DatabaseError`). If a table is needed, follow `/database-change`.
3. **Wiring.** Register the repository in `src/lib/di/container.ts`.
4. **Presentation.** `presentation/<name>.actions.ts` (validate → rate limit if public → one use case →
   `runAction`), `*.ui-model.ts`, `use-*.ts` view model, components.
5. **App.** Add the route under `src/app/`, with `buildMetadata`; pages call use cases through the container.
6. **Verify** with `/verify`. Add a Playwright test if it is a critical flow.

Do not skip a layer and do not import `data/` from presentation; `pnpm lint` will fail on it.
