import type { Metadata } from "next";
import { About } from "@/features/marketing/presentation/About";
import { CtaBanner } from "@/features/marketing/presentation/CtaBanner";
import { PageHeader } from "@/components/layout/PageHeader";
import { siteConfig } from "@/config/site";
import { getSiteUrl } from "@/lib/env.server";
import { JsonLd } from "@/lib/seo/JsonLd";
import { buildMetadata } from "@/lib/seo/metadata";
import { breadcrumbJsonLd } from "@/lib/seo/structured-data";

const TITLE = "Over ons";
const DESCRIPTION =
  "Wat begon als een kleine zaak met twee stoelen, groeide uit tot een plek waar mannen terugkomen voor meer dan een knipbeurt.";

export const metadata: Metadata = buildMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: "/over-ons",
});

export default function AboutPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd(getSiteUrl(), [
          { name: siteConfig.brandName, path: "/" },
          { name: TITLE, path: "/over-ons" },
        ])}
      />
      <main>
        <PageHeader
          badgeLabel="Over ons"
          badgeText="Vakmanschap sinds jaar en dag"
          title="Een stoel, een spiegel, aandacht."
          description="Eerlijk vakmanschap: luisteren, adviseren en dan pas de schaar."
        />
        <section className="py-24 sm:py-32">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <About extended />
          </div>
        </section>
        <CtaBanner />
      </main>
    </>
  );
}
