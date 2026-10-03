import type { Metadata } from "next";
import { getBookingDeps, getServiceDeps } from "@/lib/di/container";
import { summarizeBookings } from "@/features/booking/domain/booking.rules";
import { listAdminBookings } from "@/features/booking/domain/usecases/list-admin-bookings";
import { toBookingUIModel } from "@/features/booking/presentation/booking.ui-model";
import { Overview } from "@/features/admin/presentation/Overview";
import { listAllServices } from "@/features/services/domain/usecases/list-all-services";
import { formatDate } from "@/features/settings/domain/opening-hours.rules";
import { nowInAmsterdam } from "@/lib/utils/clock";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Overzicht" };

export default async function OverviewPage() {
  const [bookings, services] = await Promise.all([
    listAdminBookings(getBookingDeps()),
    listAllServices(getServiceDeps()),
  ]);
  const summary = summarizeBookings(bookings, formatDate(nowInAmsterdam()));

  return (
    <Overview
      confirmed={summary.confirmed}
      completed={summary.completed}
      cancelled={summary.cancelled}
      activeServices={services.filter((service) => service.isActive).length}
      upcoming={summary.upcoming.map(toBookingUIModel)}
    />
  );
}
