import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

type MetadataInput = {
  /** Page title without the brand name; the root layout appends `— BARBER`. */
  title: string;
  description: string;
  /** Path from the root, for example "/diensten". Becomes canonical and og:url. */
  path: string;
  /** For pages that do not belong in search engines (admin, cancel links, thank-you page). */
  noIndex?: boolean;
  /** Appends the brand name to the title in Open Graph and Twitter. Off for the homepage, whose title already contains it. */
  withBrandName?: boolean;
};

/**
 * One place for canonical, Open Graph and Twitter card, so no route forgets
 * them. Relative URLs are resolved by Next.js against `metadataBase` from the
 * root layout (= SITE_URL).
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
