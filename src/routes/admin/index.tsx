import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { Overview } from "@/components/admin/Overview";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [{ title: "Overzicht — Beheer" }],
  }),
  component: AdminOverviewPage,
});

function AdminOverviewPage() {
  return (
    <AdminShell>
      <Overview />
    </AdminShell>
  );
}
