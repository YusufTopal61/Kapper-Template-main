import type { Metadata } from "next";
import { getBookingDeps, getServiceDeps } from "@/lib/di/container";
import { listAdminBookings } from "@/features/booking/domain/usecases/list-admin-bookings";
import { BookingsCalendar } from "@/features/booking/presentation/BookingsCalendar";
import { toBookingUIModel } from "@/features/booking/presentation/booking.ui-model";
import { listAllServices } from "@/features/services/domain/usecases/list-all-services";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Boekingen" };

export default async function BookingsAdminPage() {
  const [bookings, services] = await Promise.all([
    listAdminBookings(getBookingDeps()),
    listAllServices(getServiceDeps()),
  ]);

  return (
    <BookingsCalendar
      bookings={bookings.map(toBookingUIModel)}
      services={services.map((service) => ({ id: service.id, name: service.name }))}
    />
  );
}
