import type { Metadata } from "next";
import { CtaBanner } from "@/features/marketing/presentation/CtaBanner";
import { Gallery } from "@/features/marketing/presentation/Gallery";
import { PageHeader } from "@/components/layout/PageHeader";
import { siteConfig } from "@/config/site";
import { getSiteUrl } from "@/lib/env.server";
import { JsonLd } from "@/lib/seo/JsonLd";
import { buildMetadata } from "@/lib/seo/metadata";
import { breadcrumbJsonLd } from "@/lib/seo/structured-data";

const TITLE = "Galerij";
const DESCRIPTION = "Een indruk van het werk, de sfeer en de zaak.";

export const metadata: Metadata = buildMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: "/galerij",
});

export default function GalleryPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd(getSiteUrl(), [
          { name: siteConfig.brandName, path: "/" },
          { name: TITLE, path: "/galerij" },
        ])}
      />
      <main>
        <PageHeader
          badgeLabel="Galerij"
          badgeText="Een blik binnen"
          title="Werk, sfeer en finish."
          description="Van scherpe fades tot verzorgde baardlijnen — dit is de standaard die we elke dag aanhouden."
        />
        <section className="py-24 sm:py-32">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <Gallery />
          </div>
        </section>
        <CtaBanner />
      </main>
    </>
  );
}
