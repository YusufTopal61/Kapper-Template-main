"use client";

import type { ReactNode } from "react";
import { Analytics } from "@/components/layout/Analytics";
import { CookieConsent } from "@/components/layout/CookieConsent";
import { StickyBookCta } from "@/components/layout/StickyBookCta";

/** Client side of the root: things that run on every page (cookie banner, analytics, mobile booking button). */
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
