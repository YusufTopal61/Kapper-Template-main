import type { Metadata } from "next";
import { getSettingsDeps } from "@/lib/di/container";
import { toBusinessData } from "@/lib/seo/business-data";
import { getPublicSettings } from "@/features/settings/domain/usecases/get-public-settings";
import { ContactSection } from "@/features/settings/presentation/ContactSection";
import { siteConfig } from "@/config/site";
import { JsonLd } from "@/lib/seo/JsonLd";
import { buildMetadata } from "@/lib/seo/metadata";
import { breadcrumbJsonLd, localBusinessJsonLd } from "@/lib/seo/structured-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildMetadata({
  title: "Contact",
  description: "Adres, openingstijden en contactgegevens. Loop gerust binnen.",
  path: "/contact",
});

export default async function ContactPage() {
  const settings = await getPublicSettings(getSettingsDeps().repo);
  const business = toBusinessData(settings);

  return (
    <>
      <JsonLd
        data={[
          localBusinessJsonLd(
            business,
            siteConfig.localType,
            `${business.url}${siteConfig.ogImage}`,
          ),
          breadcrumbJsonLd(business.url, [
            { name: siteConfig.brandName, path: "/" },
            { name: "Contact", path: "/contact" },
          ]),
        ]}
      />

      <main className="pt-24 sm:pt-28">
        <ContactSection settings={settings} heading="h1" />
      </main>
    </>
  );
}
