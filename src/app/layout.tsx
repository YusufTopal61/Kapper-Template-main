import type { Metadata, Viewport } from "next";
import { Archivo, Manrope } from "next/font/google";
import { siteConfig } from "@/shared/config/site";
import { getSiteUrl } from "@/shared/lib/env.server";
import "./globals.css";
import { Providers } from "./providers";

const archivo = Archivo({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800", "900"],
  variable: "--font-archivo",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-manrope",
  display: "swap",
});

/** In development zonder SITE_URL valt Next.js terug op de lokale server. */
const LOKALE_URL = `http://localhost:${process.env.PORT ?? 3000}`;

export function generateMetadata(): Metadata {
  return {
    metadataBase: new URL(getSiteUrl() || LOKALE_URL),
    title: { default: siteConfig.titel, template: `%s — ${siteConfig.merknaam}` },
    description: siteConfig.beschrijving,
    applicationName: siteConfig.merknaam,
    manifest: "/site.webmanifest",
    robots: { index: true, follow: true },
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "any" },
        { url: "/icon.svg", type: "image/svg+xml" },
      ],
      apple: "/apple-touch-icon.png",
    },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: siteConfig.themeColor,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang={siteConfig.taal}
      data-scroll-behavior="smooth"
      className={`${archivo.variable} ${manrope.variable}`}
    >
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
