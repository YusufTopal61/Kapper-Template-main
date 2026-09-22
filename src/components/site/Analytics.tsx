import { useEffect } from "react";
import { useCookieConsent } from "@/hooks/use-cookie-consent";

const PLAUSIBLE_DOMAIN = import.meta.env["VITE_PLAUSIBLE_DOMAIN"] as string | undefined;
const SCRIPT_ID = "plausible-analytics";

/**
 * Laadt Plausible pas nadat de bezoeker daar toestemming voor heeft gegeven
 * én er een domein is geconfigureerd. Geen van beide? Dan gebeurt er niets —
 * precies zoals de Resend-integratie: zonder configuratie faalt er niets
 * stilletjes, er wordt alleen niets geladen.
 *
 * Plausible is gekozen omdat het zonder cookies werkt en geen persoonlijke
 * data verzamelt, maar de gate hieronder is bewust generiek: vervang de
 * script-injectie door een ander privacyvriendelijk platform als je dat
 * liever gebruikt.
 */
export function Analytics() {
  const { status } = useCookieConsent();

  useEffect(() => {
    if (!PLAUSIBLE_DOMAIN || status !== "geaccepteerd") return;
    if (document.getElementById(SCRIPT_ID)) return;

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.defer = true;
    script.dataset["domain"] = PLAUSIBLE_DOMAIN;
    script.src = "https://plausible.io/js/script.js";
    document.head.appendChild(script);
  }, [status]);

  return null;
}
