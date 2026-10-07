---
paths:
  - "src/features/**"
  - "src/lib/di/**"
---

# Architecture

Per feature, imports point inward: `presentation → domain ← data`. `lib/di/container.ts` is the only
place that wires a data implementation to a domain interface.

- `domain/`: entities, Zod schemas, rules (`*.rules.ts`), use cases (`usecases/`, one per file),
  repository interfaces. Imports only zod, itself, other features' `domain/`, `lib/validations`,
  `lib/errors`, `lib/logger`. A business rule is pure and has a unit test.
- `data/`: `*.supabase.ts` repositories, `*.resend.ts` services, `*.mapper.ts` mappers. Knows domain, never React.
- `presentation/`: view models (`use-*.ts`), UI models (`*.ui-model.ts`), server actions (`*.actions.ts`),
  components. Never imports `data/` or Supabase.
- A server action validates with Zod, rate limits, calls ONE use case via the container, and returns
  through `runAction`. No business logic in actions or components.
- Reads happen in Server Components (the page calls a use case); writes go through Server Actions.
- A business rule found in a `.tsx` file moves to `domain/*.rules.ts`.
- Do not create a second component that nearly duplicates an existing one; extend the existing one.
