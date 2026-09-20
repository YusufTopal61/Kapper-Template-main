import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { fetchSession } from "@/api/auth";

const LOGIN_PAD = "/admin/login";

/**
 * Layout-route voor alles onder /admin. De beforeLoad draait op de server bij
 * SSR én bij client-side navigatie, dus dit is de plek waar niet-ingelogde
 * bezoekers worden weggestuurd.
 *
 * Dit is de UX-laag. De echte beveiliging zit in de server functions
 * (requireAdmin) en in Row Level Security.
 */
export const Route = createFileRoute("/admin")({
  beforeLoad: async ({ location }) => {
    const sessie = await fetchSession();

    const opLoginPagina = location.pathname === LOGIN_PAD;

    // Ook als Supabase nog niet geconfigureerd is: de loginpagina legt dan uit
    // wat er nog ingesteld moet worden.
    if (!sessie.ingelogd && !opLoginPagina) {
      throw redirect({ to: LOGIN_PAD });
    }

    // Al ingelogd? Dan is de loginpagina overbodig.
    if (sessie.ingelogd && opLoginPagina) {
      throw redirect({ to: "/admin" });
    }

    return { sessie };
  },
  component: AdminLayout,
});

function AdminLayout() {
  const { sessie } = Route.useRouteContext();

  // De loginpagina (en de melding dat Supabase nog niet ingesteld is) krijgen
  // geen sidebar — die rendert kaal.
  if (!sessie.ingelogd) {
    return <Outlet />;
  }

  return (
    <AdminShell email={sessie.email}>
      <Outlet />
    </AdminShell>
  );
}
