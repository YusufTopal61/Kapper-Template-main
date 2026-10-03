import { createFileRoute } from "@tanstack/react-router";
import { BookingsCalendar } from "@/modules/booking/presentation/BookingsCalendar";

export const Route = createFileRoute("/admin/boekingen")({
  head: () => ({
    meta: [{ title: "Boekingen — Beheer" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: BookingsCalendar,
});
