---
paths:
  - "**/*.test.ts"
  - "tests/**"
---

# Testing

- Unit tests (Vitest) for domain rules, use cases (with in-memory fakes), schemas, mappers and SEO builders.
  They need no database and no browser. Test titles are English sentences describing behavior.
- Playwright for the critical flows: booking, cancel via link, admin access, public pages. Select by role,
  label or `aria-*`; wait for UI state instead of sleeping.
- Test outcomes, not implementation. A bug fix starts with a failing test.
- Do not test trivial components. Do not mock what you can fake in memory.
