import type { Metadata } from "next";
import { getSettingsDeps } from "@/app/di/container";
import { bedrijfsGegevens } from "@/app/site-seo";
import { getPublicSettings } from "@/modules/settings/domain/usecases/getPublicSettings";
import { ContactSection } from "@/modules/settings/presentation/ContactSection";
import { siteConfig } from "@/shared/config/site";
import { JsonLd } from "@/shared/seo/JsonLd";
import { maakMetadata } from "@/shared/seo/metadata";
import { breadcrumbJsonLd, localBusinessJsonLd } from "@/shared/seo/structured-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = maakMetadata({
  titel: "Contact",
  beschrijving: "Adres, openingstijden en contactgegevens. Loop gerust binnen.",
  pad: "/contact",
});

export default async function ContactPage() {
  const instellingen = await getPublicSettings(getSettingsDeps().repo);
  const bedrijf = bedrijfsGegevens(instellingen);

  return (
    <>
      <JsonLd
        data={[
          localBusinessJsonLd(
            bedrijf,
            siteConfig.lokaalType,
            `${bedrijf.url}${siteConfig.ogImage}`,
          ),
          breadcrumbJsonLd(bedrijf.url, [
            { naam: siteConfig.merknaam, pad: "/" },
            { naam: "Contact", pad: "/contact" },
          ]),
        ]}
      />

      <main className="pt-24 sm:pt-28">
        <ContactSection instellingen={instellingen} kop="h1" />
      </main>
    </>
  );
}
