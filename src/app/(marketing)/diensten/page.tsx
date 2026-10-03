import type { Metadata } from "next";
import { getServiceDeps, getSettingsDeps } from "@/lib/di/container";
import { toBusinessData } from "@/lib/seo/business-data";
import { listActiveServices } from "@/features/services/domain/usecases/list-active-services";
import { toServiceUIModel } from "@/features/services/presentation/service.ui-model";
import { ServicesSection } from "@/features/services/presentation/ServicesSection";
import { getPublicSettings } from "@/features/settings/domain/usecases/get-public-settings";
import { CtaBanner } from "@/features/marketing/presentation/CtaBanner";
import { PageHeader } from "@/components/layout/PageHeader";
import { siteConfig } from "@/config/site";
import { JsonLd } from "@/lib/seo/JsonLd";
import { buildMetadata } from "@/lib/seo/metadata";
import { breadcrumbJsonLd, serviceJsonLd } from "@/lib/seo/structured-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildMetadata({
  title: "Diensten",
  description:
    "Knippen, baard en de volledige behandeling. Bekijk prijs, duur en wat elke dienst inhoudt.",
  path: "/diensten",
});

export default async function ServicesPage() {
  const [services, settings] = await Promise.all([
    listActiveServices(getServiceDeps().repo),
    getPublicSettings(getSettingsDeps().repo),
  ]);
  const business = toBusinessData(settings);

  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd(business.url, [
            { name: siteConfig.brandName, path: "/" },
            { name: "Diensten", path: "/diensten" },
          ]),
          ...services.map((service) =>
            serviceJsonLd(
              { name: service.name, description: service.description, price: service.price },
              business,
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
        <ServicesSection services={services.map(toServiceUIModel)} />
        <CtaBanner />
      </main>
    </>
  );
}
