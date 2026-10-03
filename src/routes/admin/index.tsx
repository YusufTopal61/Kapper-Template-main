import { createFileRoute } from "@tanstack/react-router";
import { Overview } from "@/modules/admin/presentation/Overview";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [{ title: "Overzicht — Beheer" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: Overview,
});
