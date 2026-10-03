import type { Metadata } from "next";
import type { ReactNode } from "react";

// Het beheerpaneel hoort nergens in zoekmachines (ook niet via de sitemap).
export const metadata: Metadata = {
  title: "Beheer",
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return children;
}
