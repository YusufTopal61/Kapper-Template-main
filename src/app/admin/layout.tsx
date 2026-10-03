import type { Metadata } from "next";
import type { ReactNode } from "react";

// The admin panel never belongs in search engines (not via the sitemap either).
export const metadata: Metadata = {
  title: "Beheer",
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return children;
}
