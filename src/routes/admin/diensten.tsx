import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { ServicesManager } from "@/components/admin/ServicesManager";

export const Route = createFileRoute("/admin/diensten")({
  head: () => ({
    meta: [{ title: "Diensten — Beheer" }],
  }),
  component: AdminDienstenPage,
});

function AdminDienstenPage() {
  return (
    <AdminShell>
      <ServicesManager />
    </AdminShell>
  );
}
