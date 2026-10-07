"use client";

import { useCookieConsent } from "@/hooks/use-cookie-consent";

/** Reopens the cookie banner so a choice can be changed or withdrawn at any time. */
export function CookieSettingsButton() {
  const { reset } = useCookieConsent();

  return (
    <button type="button" onClick={reset} className="transition-colors hover:text-foreground">
      Cookie-instellingen
    </button>
  );
}
