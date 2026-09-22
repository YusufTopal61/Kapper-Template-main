import { createFileRoute, Outlet } from "@tanstack/react-router";

// Pure pass-through layout: /boeken en /boeken/bevestigd hebben elk hun eigen
// volledige pagina (geen gedeelde chrome), maar TanStack Router vereist een
// Outlet op dit segment zodat /boeken/bevestigd niet als kind onzichtbaar blijft.
export const Route = createFileRoute("/boeken")({
  component: () => <Outlet />,
});
