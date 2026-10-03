import { createFileRoute } from "@tanstack/react-router";
import { SettingsForm } from "@/modules/settings/presentation/SettingsForm";

export const Route = createFileRoute("/admin/instellingen")({
  head: () => ({
    meta: [{ title: "Instellingen — Beheer" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: SettingsForm,
});
