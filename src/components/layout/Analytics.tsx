"use client";

import { useEffect } from "react";
import { plausibleDomain } from "@/lib/env";
import { useCookieConsent } from "../../hooks/use-cookie-consent";

const SCRIPT_ID = "plausible-analytics";

/**
 * Loads Plausible only after the visitor has consented and a domain is
 * configured. Neither? Then nothing happens — just like the Resend integration:
 * without configuration nothing fails silently, nothing is loaded.
 *
 * Plausible was chosen because it works without cookies and collects no
 * personal data, but the gate below is deliberately generic: replace the script
 * injection with another privacy-friendly platform if you prefer.
 */
export function Analytics() {
  const { status } = useCookieConsent();

  useEffect(() => {
    if (!plausibleDomain || status !== "accepted") return;
    if (document.getElementById(SCRIPT_ID)) return;

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.defer = true;
    script.dataset["domain"] = plausibleDomain;
    script.src = "https://plausible.io/js/script.js";
    document.head.appendChild(script);
  }, [status]);

  return null;
}
