import type { Metadata } from "next";
import { siteConfig } from "@/shared/config/site";

type MetadataInput = {
  /** Paginatitel zonder merknaam; de root-layout plakt `— BARBER` erachter. */
  titel: string;
  beschrijving: string;
  /** Pad vanaf de root, bijvoorbeeld "/diensten". Wordt canonical én og:url. */
  pad: string;
  /** Voor pagina's die niet in zoekmachines horen (beheer, annuleerlinks, bedankpagina). */
  nietIndexeren?: boolean;
  /** Zet de merknaam achter de titel in Open Graph en Twitter. Uit voor de homepage, waar de titel hem al bevat. */
  metMerknaam?: boolean;
};

/**
 * Eén plek voor canonical, Open Graph en Twitter-kaart, zodat geen enkele
 * route die vergeet. Relatieve URL's worden door Next.js tegen `metadataBase`
 * uit de root-layout opgelost (= SITE_URL).
 */
export function maakMetadata({
  titel,
  beschrijving,
  pad,
  nietIndexeren,
  metMerknaam = true,
}: MetadataInput): Metadata {
  const volledigeTitel = metMerknaam ? `${titel} — ${siteConfig.merknaam}` : titel;

  return {
    title: titel,
    description: beschrijving,
    alternates: { canonical: pad },
    openGraph: {
      title: volledigeTitel,
      description: beschrijving,
      url: pad,
      siteName: siteConfig.merknaam,
      locale: siteConfig.locale,
      type: "website",
      images: [{ url: siteConfig.ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: volledigeTitel,
      description: beschrijving,
      images: [siteConfig.ogImage],
    },
    ...(nietIndexeren ? { robots: { index: false, follow: false } } : {}),
  };
}
