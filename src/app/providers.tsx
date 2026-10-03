"use client";

import type { ReactNode } from "react";
import { Analytics } from "@/modules/site/presentation/Analytics";
import { CookieConsent } from "@/modules/site/presentation/CookieConsent";
import { StickyBookCta } from "@/modules/site/presentation/StickyBookCta";

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
