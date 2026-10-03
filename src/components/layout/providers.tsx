"use client";

import type { ReactNode } from "react";
import { Analytics } from "@/components/layout/Analytics";
import { CookieConsent } from "@/components/layout/CookieConsent";
import { StickyBookCta } from "@/components/layout/StickyBookCta";

/** Client-kant van de root: dingen die op elke pagina meedraaien (cookiebanner, analytics, mobiele boekknop). */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <StickyBookCta />
      <CookieConsent />
      <Analytics />
    </>
  );
}
