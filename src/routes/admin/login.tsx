import { createFileRoute } from "@tanstack/react-router";
import { LoginForm } from "@/modules/auth/presentation/LoginForm";

export const Route = createFileRoute("/admin/login")({
  head: () => ({
    meta: [{ title: "Inloggen — Beheer" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: LoginPagina,
});

function LoginPagina() {
  const { sessie } = Route.useRouteContext();
  return <LoginForm supabaseGeconfigureerd={sessie.supabaseGeconfigureerd} />;
}
