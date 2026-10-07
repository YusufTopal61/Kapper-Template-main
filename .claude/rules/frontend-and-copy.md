---
paths:
  - "src/components/**"
  - "src/features/*/presentation/**"
  - "src/app/**"
---

# Frontend and copy

Design: calm, mature Dutch-studio look. One light palette (paper, ink, one accent). No stock photos,
no AI-generated imagery, no glows or decorative gradients, no floating action buttons. Illustrations are
simple own line art or real screenshots. Motion only where it clarifies, and respect `prefers-reduced-motion`.

Copy (Dutch): "je", concrete, businesslike but human, no hype. **Never invent** customer names, testimonials,
reviews, numbers, team size, years of experience or history. Real content only; render a section only
when real content exists. Do not repeat the same message twice on a page.

Quality: mobile first (375 px), one `h1` per page, semantic HTML, visible focus, keyboard operable,
sufficient contrast. Every action gives feedback: loading, confirmation, and an error that says what to do.
`'use client'` as deep in the tree as possible; reuse `components/ui` instead of restyling buttons or inputs.
