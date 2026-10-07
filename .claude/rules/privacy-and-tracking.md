---
paths:
  - "src/components/layout/**"
  - "src/hooks/use-cookie-consent.ts"
  - "src/lib/utils/consent.ts"
  - "src/lib/seo/**"
  - "src/features/booking/**"
---

# Privacy and tracking

- **Nothing loads before consent**: no scripts, cookies or third-party requests until the visitor chooses.
- Consent is versioned and expires; a new version or expiry asks again. Withdrawing is as easy as
  accepting, and is reachable from every public page.
- No tracking on `/admin`, and never on pages that show personal data.
- Events never contain personal data or free text. A conversion counts only after a booking was actually saved.
- Personal data (name, email, phone) is never put in a URL, a log line, or analytics.
- Legal pages (privacy, terms) stay `noindex` and out of the sitemap until the owner or a lawyer approved the text.
