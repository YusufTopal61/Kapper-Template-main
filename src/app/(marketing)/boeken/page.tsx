import type { Metadata } from "next";
import { getServiceDeps, getSettingsDeps } from "@/lib/di/container";
import { BookingWizard } from "@/features/booking/presentation/BookingWizard";
import { listActiveServices } from "@/features/services/domain/usecases/list-active-services";
import { toServiceUIModel } from "@/features/services/presentation/service.ui-model";
import { getPublicSettings } from "@/features/settings/domain/usecases/get-public-settings";
import { isSupabaseConfigured } from "@/lib/env";
import { buildMetadata } from "@/lib/seo/metadata";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildMetadata({
  title: "Boeken",
  description: "Kies je behandeling, pak een tijdslot en klaar. Bevestiging volgt direct.",
  path: "/boeken",
});

export default async function BookingPage() {
  const [services, settings] = await Promise.all([
    listActiveServices(getServiceDeps().repo),
    getPublicSettings(getSettingsDeps().repo),
  ]);

  return (
    <main className="pt-24 sm:pt-28">
      <BookingWizard
        heading="h1"
        services={services.map(toServiceUIModel)}
        openingHours={settings.openingHours}
        configured={isSupabaseConfigured}
      />
    </main>
  );
}
