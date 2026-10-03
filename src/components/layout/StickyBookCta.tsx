"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { useCookieConsent } from "@/hooks/use-cookie-consent";

/**
 * Fixed bottom bar on mobile with a direct booking button. Stays away on
 * /boeken itself (already a CTA in view), in the admin panel, and while the
 * cookie banner still asks for a choice — so the two fixed bars never collide.
 */
export function StickyBookCta() {
  const pathname = usePathname();
  const { status, ready } = useCookieConsent();

  const hiddenPath = pathname.startsWith("/admin") || pathname.startsWith("/boeken");
  const awaitingCookieChoice = ready && status === "unknown";

  if (hiddenPath || awaitingCookieChoice) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 px-4 py-3 backdrop-blur-xl sm:hidden"
      style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
    >
      <Link
        href="/boeken"
        className="flex items-center justify-center gap-2 rounded-full bg-foreground py-3 text-sm font-semibold text-background transition-opacity active:opacity-80"
      >
        Plan afspraak
        <ArrowRight className="size-4" />
      </Link>
    </div>
  );
}
