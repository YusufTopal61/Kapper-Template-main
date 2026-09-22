import { Link, useRouterState } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useCookieConsent } from "@/hooks/use-cookie-consent";

/**
 * Vaste onderbalk op mobiel met een directe boekingsknop. Blijft weg op
 * /boeken zelf (al een CTA in beeld), in het beheerpaneel, en zolang de
 * cookiebanner nog een keuze vraagt — zo botsen de twee vaste balken nooit.
 */
export function StickyBookCta() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { status, klaar } = useCookieConsent();

  const verborgenPad = pathname.startsWith("/admin") || pathname.startsWith("/boeken");
  const wachtOpCookiekeuze = klaar && status === "onbekend";

  if (verborgenPad || wachtOpCookiekeuze) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 px-4 py-3 backdrop-blur-xl sm:hidden"
      style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
    >
      <Link
        to="/boeken"
        className="flex items-center justify-center gap-2 rounded-full bg-foreground py-3 text-sm font-semibold text-background transition-opacity active:opacity-80"
      >
        Plan afspraak
        <ArrowRight className="size-4" />
      </Link>
    </div>
  );
}
