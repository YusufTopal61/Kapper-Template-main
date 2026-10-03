import type { Metadata } from "next";
import { getServiceDeps, getSettingsDeps } from "@/app/di/container";
import { bedrijfsGegevens } from "@/app/site-seo";
import { BookingWizard } from "@/modules/booking/presentation/BookingWizard";
import { listActiveServices } from "@/modules/services/domain/usecases/listActiveServices";
import { naarServiceUIModel } from "@/modules/services/presentation/service.uimodel";
import { ServicesSection } from "@/modules/services/presentation/ServicesSection";
import { getPublicSettings } from "@/modules/settings/domain/usecases/getPublicSettings";
import { ContactSection } from "@/modules/settings/presentation/ContactSection";
import { About } from "@/modules/site/presentation/About";
import { Gallery } from "@/modules/site/presentation/Gallery";
import { Hero } from "@/modules/site/presentation/Hero";
import { Testimonials } from "@/modules/site/presentation/Testimonials";
import { siteConfig } from "@/shared/config/site";
import { isSupabaseConfigured } from "@/shared/lib/env";
import { JsonLd } from "@/shared/seo/JsonLd";
import { maakMetadata } from "@/shared/seo/metadata";
import {
  localBusinessJsonLd,
  organizationJsonLd,
  serviceJsonLd,
  websiteJsonLd,
} from "@/shared/seo/structured-data";

// Leest de database; nooit statisch voorgerenderd (een mislukte query bij de build zou anders blijven hangen).
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  ...maakMetadata({
    titel: siteConfig.titel,
    beschrijving: siteConfig.beschrijving,
    pad: "/",
    metMerknaam: false,
  }),
  title: { absolute: siteConfig.titel },
};

export default async function HomePage() {
  const [diensten, instellingen] = await Promise.all([
    listActiveServices(getServiceDeps().repo),
    getPublicSettings(getSettingsDeps().repo),
  ]);
  const bedrijf = bedrijfsGegevens(instellingen);

  return (
    <>
      <JsonLd
        data={[
          organizationJsonLd(bedrijf, `${bedrijf.url}/icon-512.png`),
          websiteJsonLd(bedrijf, siteConfig.taal),
          localBusinessJsonLd(
            bedrijf,
            siteConfig.lokaalType,
            `${bedrijf.url}${siteConfig.ogImage}`,
          ),
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
        <Hero />
        <ServicesSection diensten={diensten.map(naarServiceUIModel)} />
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
          diensten={diensten.map(naarServiceUIModel)}
          openingstijden={instellingen.openingstijden}
          geconfigureerd={isSupabaseConfigured}
        />
        <section className="py-24 sm:py-32">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <Testimonials />
          </div>
        </section>
        <ContactSection instellingen={instellingen} />
      </main>
    </>
  );
}
