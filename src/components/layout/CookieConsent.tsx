"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { Cookie } from "lucide-react";
import { useCookieConsent } from "@/hooks/use-cookie-consent";

export function CookieConsent() {
  const { status, ready, accept, decline } = useCookieConsent();
  const pathname = usePathname();

  // Geen cookiebanner in het beheerpaneel — dat is geen publieke pagina.
  const isAdmin = pathname.startsWith("/admin");
  const visible = ready && status === "unknown" && !isAdmin;

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-x-0 bottom-0 z-[60] border-t border-border bg-background/95 px-5 py-4 backdrop-blur-xl sm:px-8"
          style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
          role="region"
          aria-label="Cookiemelding"
        >
          <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-4">
            <Cookie className="hidden size-5 shrink-0 text-foreground sm:block" />
            <p className="flex-1 text-sm leading-relaxed text-muted-foreground">
              We gebruiken alleen noodzakelijke cookies om de site te laten werken. Met jouw
              toestemming gebruiken we daarnaast privacyvriendelijke statistieken om te zien welke
              pagina&apos;s bezocht worden.{" "}
              <Link
                href="/privacybeleid"
                className="font-medium text-foreground underline underline-offset-2"
              >
                Meer over cookies
              </Link>
            </p>
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={decline}
                className="rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                Weigeren
              </button>
              <button
                type="button"
                onClick={accept}
                className="rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-background transition-opacity hover:opacity-85"
              >
                Accepteren
              </button>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
