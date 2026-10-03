import type { Metadata } from "next";
import { getServiceDeps, getSettingsDeps } from "@/app/di/container";
import { bedrijfsGegevens } from "@/app/site-seo";
import { listActiveServices } from "@/modules/services/domain/usecases/listActiveServices";
import { naarServiceUIModel } from "@/modules/services/presentation/service.uimodel";
import { ServicesSection } from "@/modules/services/presentation/ServicesSection";
import { getPublicSettings } from "@/modules/settings/domain/usecases/getPublicSettings";
import { CtaBanner } from "@/modules/site/presentation/CtaBanner";
import { PageHeader } from "@/modules/site/presentation/PageHeader";
import { siteConfig } from "@/shared/config/site";
import { JsonLd } from "@/shared/seo/JsonLd";
import { maakMetadata } from "@/shared/seo/metadata";
import { breadcrumbJsonLd, serviceJsonLd } from "@/shared/seo/structured-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = maakMetadata({
  titel: "Diensten",
  beschrijving:
    "Knippen, baard en de volledige behandeling. Bekijk prijs, duur en wat elke dienst inhoudt.",
  pad: "/diensten",
});

export default async function DienstenPage() {
  const [diensten, instellingen] = await Promise.all([
    listActiveServices(getServiceDeps().repo),
    getPublicSettings(getSettingsDeps().repo),
  ]);
  const bedrijf = bedrijfsGegevens(instellingen);

  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd(bedrijf.url, [
            { naam: siteConfig.merknaam, pad: "/" },
            { naam: "Diensten", pad: "/diensten" },
          ]),
          ...diensten.map((dienst) =>
            serviceJsonLd(
              { naam: dienst.naam, beschrijving: dienst.beschrijving, prijs: dienst.prijs },
              bedrijf,
              "/diensten",
            ),
          ),
        ]}
      />

      <main>
        <PageHeader
          badgeLabel="Diensten"
          badgeText="Vakwerk, tot in de details"
          title="Wat we doen."
          description="Geen eindeloze menukaart. Alleen wat we tot in de puntjes beheersen — knippen, baard en de combinatie van de twee."
        />
        <ServicesSection diensten={diensten.map(naarServiceUIModel)} />
        <CtaBanner />
      </main>
    </>
  );
}
