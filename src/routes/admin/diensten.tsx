import { createFileRoute } from "@tanstack/react-router";
import { ServicesManager } from "@/components/admin/ServicesManager";

export const Route = createFileRoute("/admin/diensten")({
  head: () => ({
    meta: [{ title: "Diensten — Beheer" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: ServicesManager,
});
