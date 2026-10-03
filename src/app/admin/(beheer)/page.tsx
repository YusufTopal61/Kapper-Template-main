import type { Metadata } from "next";
import { getBookingDeps, getServiceDeps } from "@/app/di/container";
import { samenvattingVanBoekingen } from "@/modules/booking/domain/booking.rules";
import { listAdminBookings } from "@/modules/booking/domain/usecases/listAdminBookings";
import { naarBookingUIModel } from "@/modules/booking/presentation/booking.uimodel";
import { Overview } from "@/modules/admin/presentation/Overview";
import { listAllServices } from "@/modules/services/domain/usecases/listAllServices";
import { formatDatum } from "@/modules/settings/domain/opening-hours.rules";
import { nuInAmsterdam } from "@/shared/lib/clock";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Overzicht" };

export default async function OverzichtPagina() {
  const [boekingen, diensten] = await Promise.all([
    listAdminBookings(getBookingDeps()),
    listAllServices(getServiceDeps()),
  ]);
  const samenvatting = samenvattingVanBoekingen(boekingen, formatDatum(nuInAmsterdam()));

  return (
    <Overview
      bevestigd={samenvatting.bevestigd}
      voltooid={samenvatting.voltooid}
      geannuleerd={samenvatting.geannuleerd}
      actieveDiensten={diensten.filter((dienst) => dienst.actief).length}
      aankomend={samenvatting.aankomend.map(naarBookingUIModel)}
    />
  );
}
