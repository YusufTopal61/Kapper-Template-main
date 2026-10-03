import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

type MetadataInput = {
  /** Paginatitel zonder merknaam; de root-layout plakt `— BARBER` erachter. */
  title: string;
  description: string;
  /** Pad vanaf de root, bijvoorbeeld "/diensten". Wordt canonical én og:url. */
  path: string;
  /** Voor pagina's die niet in zoekmachines horen (beheer, annuleerlinks, bedankpagina). */
  noIndex?: boolean;
  /** Zet de merknaam achter de titel in Open Graph en Twitter. Uit voor de homepage, waar de titel hem al bevat. */
  withBrandName?: boolean;
};

/**
 * Eén plek voor canonical, Open Graph en Twitter-kaart, zodat geen enkele
 * route die vergeet. Relatieve URL's worden door Next.js tegen `metadataBase`
 * uit de root-layout opgelost (= SITE_URL).
 */
export function buildMetadata({
  title,
  description,
  path,
  noIndex,
  withBrandName = true,
}: MetadataInput): Metadata {
  const fullTitle = withBrandName ? `${title} — ${siteConfig.brandName}` : title;

  return {
    title: title,
    description: description,
    alternates: { canonical: path },
    openGraph: {
      title: fullTitle,
      description: description,
      url: path,
      siteName: siteConfig.brandName,
      locale: siteConfig.locale,
      type: "website",
      images: [{ url: siteConfig.ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: description,
      images: [siteConfig.ogImage],
    },
    ...(noIndex ? { robots: { index: false, follow: false } } : {}),
  };
}
