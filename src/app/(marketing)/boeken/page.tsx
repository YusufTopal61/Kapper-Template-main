import type { Metadata } from "next";
import { getServiceDeps, getSettingsDeps } from "@/app/di/container";
import { BookingWizard } from "@/modules/booking/presentation/BookingWizard";
import { listActiveServices } from "@/modules/services/domain/usecases/listActiveServices";
import { naarServiceUIModel } from "@/modules/services/presentation/service.uimodel";
import { getPublicSettings } from "@/modules/settings/domain/usecases/getPublicSettings";
import { isSupabaseConfigured } from "@/shared/lib/env";
import { maakMetadata } from "@/shared/seo/metadata";

export const dynamic = "force-dynamic";

export const metadata: Metadata = maakMetadata({
  titel: "Boeken",
  beschrijving: "Kies je behandeling, pak een tijdslot en klaar. Bevestiging volgt direct.",
  pad: "/boeken",
});

export default async function BoekenPage() {
  const [diensten, instellingen] = await Promise.all([
    listActiveServices(getServiceDeps().repo),
    getPublicSettings(getSettingsDeps().repo),
  ]);

  return (
    <main className="pt-24 sm:pt-28">
      <BookingWizard
        kop="h1"
        diensten={diensten.map(naarServiceUIModel)}
        openingstijden={instellingen.openingstijden}
        geconfigureerd={isSupabaseConfigured}
      />
    </main>
  );
}
