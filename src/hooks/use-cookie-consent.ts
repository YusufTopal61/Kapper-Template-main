import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "cookie_consent";

export type CookieConsentStatus = "onbekend" | "geaccepteerd" | "geweigerd";

function leesOpgeslagenKeuze(): CookieConsentStatus {
  try {
    const waarde = window.localStorage.getItem(STORAGE_KEY);
    return waarde === "geaccepteerd" || waarde === "geweigerd" ? waarde : "onbekend";
  } catch {
    // localStorage kan geblokkeerd zijn (privénavigatie, restricted cookies).
    // Dan tonen we de banner gewoon elke keer opnieuw i.p.v. te crashen.
    return "onbekend";
  }
}

/**
 * Consent-status voor niet-noodzakelijke cookies (analytics). De inlog-
 * sessie van de beheerder loopt via functionele Supabase-cookies die geen
 * toestemming vereisen; alleen tracking wordt hierdoor gate-houden.
 */
export function useCookieConsent() {
  const [status, setStatus] = useState<CookieConsentStatus>("onbekend");
  const [klaar, setKlaar] = useState(false);

  useEffect(() => {
    setStatus(leesOpgeslagenKeuze());
    setKlaar(true);
  }, []);

  const zetKeuze = useCallback((keuze: Exclude<CookieConsentStatus, "onbekend">) => {
    setStatus(keuze);
    try {
      window.localStorage.setItem(STORAGE_KEY, keuze);
    } catch {
      // Kon niet opgeslagen worden — de keuze geldt dan alleen voor dit bezoek.
    }
  }, []);

  return {
    status,
    /** true zodra de opgeslagen keuze (of het ontbreken daarvan) is uitgelezen. */
    klaar,
    accepteer: () => zetKeuze("geaccepteerd"),
    weiger: () => zetKeuze("geweigerd"),
  };
}
