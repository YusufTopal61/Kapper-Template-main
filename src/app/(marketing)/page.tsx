import type { Metadata } from "next";
import { getServiceDeps, getSettingsDeps } from "@/lib/di/container";
import { toBusinessData } from "@/lib/seo/business-data";
import { BookingWizard } from "@/features/booking/presentation/BookingWizard";
import { listActiveServices } from "@/features/services/domain/usecases/list-active-services";
import { toServiceUIModel } from "@/features/services/presentation/service.ui-model";
import { ServicesSection } from "@/features/services/presentation/ServicesSection";
import { getPublicSettings } from "@/features/settings/domain/usecases/get-public-settings";
import { ContactSection } from "@/features/settings/presentation/ContactSection";
import { About } from "@/features/marketing/presentation/About";
import { Gallery } from "@/features/marketing/presentation/Gallery";
import { Hero } from "@/features/marketing/presentation/Hero";
import { Testimonials } from "@/features/marketing/presentation/Testimonials";
import { siteConfig } from "@/config/site";
import { isSupabaseConfigured } from "@/lib/env";
import { JsonLd } from "@/lib/seo/JsonLd";
import { buildMetadata } from "@/lib/seo/metadata";
import {
  localBusinessJsonLd,
  organizationJsonLd,
  serviceJsonLd,
  websiteJsonLd,
} from "@/lib/seo/structured-data";

// Leest de database; nooit statisch voorgerenderd (een mislukte query bij de build zou anders blijven hangen).
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  ...buildMetadata({
    title: siteConfig.title,
    description: siteConfig.description,
    path: "/",
    withBrandName: false,
  }),
  title: { absolute: siteConfig.title },
};

export default async function HomePage() {
  const [services, settings] = await Promise.all([
    listActiveServices(getServiceDeps().repo),
    getPublicSettings(getSettingsDeps().repo),
  ]);
  const business = toBusinessData(settings);

  return (
    <>
      <JsonLd
        data={[
          organizationJsonLd(business, `${business.url}/icon-512.png`),
          websiteJsonLd(business, siteConfig.language),
          localBusinessJsonLd(
            business,
            siteConfig.localType,
            `${business.url}${siteConfig.ogImage}`,
          ),
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
        <Hero />
        <ServicesSection services={services.map(toServiceUIModel)} />
        <section className="py-24 sm:py-32">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <About />
          </div>
        </section>
        <section className="pb-24 sm:pb-32">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <Gallery limit={6} />
          </div>
        </section>
        <BookingWizard
          services={services.map(toServiceUIModel)}
          openingHours={settings.openingHours}
          configured={isSupabaseConfigured}
        />
        <section className="py-24 sm:py-32">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <Testimonials />
          </div>
        </section>
        <ContactSection settings={settings} />
      </main>
    </>
  );
}
