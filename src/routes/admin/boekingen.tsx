import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { BookingsCalendar } from "@/components/admin/BookingsCalendar";

export const Route = createFileRoute("/admin/boekingen")({
  head: () => ({
    meta: [{ title: "Boekingen — Beheer" }],
  }),
  component: AdminBoekingenPage,
});

function AdminBoekingenPage() {
  return (
    <AdminShell>
      <BookingsCalendar />
    </AdminShell>
  );
}
