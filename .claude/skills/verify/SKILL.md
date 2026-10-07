---
name: verify
description: Run the full verification for this repo and report evidence. Use before saying a change is done.
---

# Verify

Run, in order, and stop at the first failure to fix the root cause:

```bash
pnpm format:check && pnpm lint && pnpm typecheck && pnpm test && pnpm build
```

Then check the changed flow in the browser (or `pnpm test:e2e` for booking and admin). For a change that
touches secrets or the client bundle, grep `.next/static` for the service-role key value and for
`service_role`, `api.resend.com`, `annuleer_token`: there must be no match.

Final report, short and evidence-based:

1. what changed and why (root cause or chosen approach);
2. files touched;
3. each command with its exit status and any relevant error lines (not the full log);
4. remaining risks or assumptions.
