import type { Metadata } from "next";
import { About } from "@/modules/site/presentation/About";
import { CtaBanner } from "@/modules/site/presentation/CtaBanner";
import { PageHeader } from "@/modules/site/presentation/PageHeader";
import { siteConfig } from "@/shared/config/site";
import { getSiteUrl } from "@/shared/lib/env.server";
import { JsonLd } from "@/shared/seo/JsonLd";
import { maakMetadata } from "@/shared/seo/metadata";
import { breadcrumbJsonLd } from "@/shared/seo/structured-data";

const TITEL = "Over ons";
const BESCHRIJVING =
  "Wat begon als een kleine zaak met twee stoelen, groeide uit tot een plek waar mannen terugkomen voor meer dan een knipbeurt.";

export const metadata: Metadata = maakMetadata({
  titel: TITEL,
  beschrijving: BESCHRIJVING,
  pad: "/over-ons",
});

export default function OverOnsPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd(getSiteUrl(), [
          { naam: siteConfig.merknaam, pad: "/" },
          { naam: TITEL, pad: "/over-ons" },
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
