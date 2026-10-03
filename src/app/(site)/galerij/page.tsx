import type { Metadata } from "next";
import { CtaBanner } from "@/modules/site/presentation/CtaBanner";
import { Gallery } from "@/modules/site/presentation/Gallery";
import { PageHeader } from "@/modules/site/presentation/PageHeader";
import { siteConfig } from "@/shared/config/site";
import { getSiteUrl } from "@/shared/lib/env.server";
import { JsonLd } from "@/shared/seo/JsonLd";
import { maakMetadata } from "@/shared/seo/metadata";
import { breadcrumbJsonLd } from "@/shared/seo/structured-data";

const TITEL = "Galerij";
const BESCHRIJVING = "Een indruk van het werk, de sfeer en de zaak.";

export const metadata: Metadata = maakMetadata({
  titel: TITEL,
  beschrijving: BESCHRIJVING,
  pad: "/galerij",
});

export default function GalerijPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd(getSiteUrl(), [
          { naam: siteConfig.merknaam, pad: "/" },
          { naam: TITEL, pad: "/galerij" },
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
