import type { Metadata } from "next";
import { getBookingDeps, getServiceDeps } from "@/app/di/container";
import { listAdminBookings } from "@/modules/booking/domain/usecases/listAdminBookings";
import { BookingsCalendar } from "@/modules/booking/presentation/BookingsCalendar";
import { naarBookingUIModel } from "@/modules/booking/presentation/booking.uimodel";
import { listAllServices } from "@/modules/services/domain/usecases/listAllServices";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Boekingen" };

export default async function BoekingenPagina() {
  const [boekingen, diensten] = await Promise.all([
    listAdminBookings(getBookingDeps()),
    listAllServices(getServiceDeps()),
  ]);

  return (
    <BookingsCalendar
      boekingen={boekingen.map(naarBookingUIModel)}
      diensten={diensten.map((dienst) => ({ id: dienst.id, naam: dienst.naam }))}
    />
  );
}
