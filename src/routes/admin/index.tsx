import { createFileRoute } from "@tanstack/react-router";
import { Overview } from "@/components/admin/Overview";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [{ title: "Overzicht — Beheer" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: Overview,
});
