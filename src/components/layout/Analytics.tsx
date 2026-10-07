"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { plausibleDomain } from "@/lib/env";
import { useCookieConsent } from "../../hooks/use-cookie-consent";

const SCRIPT_ID = "plausible-analytics";

/**
 * Loads Plausible only after the visitor has consented, a domain is
 * configured and the page is public. Otherwise nothing happens: no script,
 * no request. The admin panel is never tracked. When consent is withdrawn the
 * script is removed again (a full reload clears what it already set up).
 *
 * Plausible was chosen because it works without cookies and collects no
 * personal data, but the gate below is deliberately generic: replace the script
 * injection with another privacy-friendly platform if you prefer.
 */
export function Analytics() {
  const { status } = useCookieConsent();
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const allowed = Boolean(plausibleDomain) && status === "accepted" && !isAdmin;

  useEffect(() => {
    const existing = document.getElementById(SCRIPT_ID);

    if (!allowed) {
      existing?.remove();
      return;
    }
    if (existing || !plausibleDomain) return;

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.defer = true;
    script.dataset["domain"] = plausibleDomain;
    script.src = "https://plausible.io/js/script.js";
    document.head.appendChild(script);
  }, [allowed]);

  return null;
}
