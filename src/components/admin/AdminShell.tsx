import type { ReactNode } from "react";
import { Link, useRouter, useRouterState } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  CalendarDays,
  LayoutGrid,
  Loader2,
  LogOut,
  Scissors,
  Settings,
  TriangleAlert,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { signOut } from "@/api/auth";
import { fetchAdminSettings } from "@/api/settings";

const adminNav = [
  { label: "Overzicht", to: "/admin", icon: LayoutGrid },
  { label: "Boekingen", to: "/admin/boekingen", icon: CalendarDays },
  { label: "Diensten", to: "/admin/diensten", icon: Scissors },
  { label: "Instellingen", to: "/admin/instellingen", icon: Settings },
] as const;

export function AdminShell({ children, email }: { children: ReactNode; email: string | null }) {
  const router = useRouter();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const instellingen = useQuery({
    queryKey: ["settings", "admin"],
    queryFn: () => fetchAdminSettings(),
  });

  const uitloggen = useMutation({
    mutationFn: () => signOut(),
    onSuccess: async () => {
      await router.invalidate();
      await router.navigate({ to: "/admin/login" });
    },
  });

  const activeLabel = adminNav.find((n) => n.to === pathname)?.label ?? "Beheer";
  const emailOntbreekt = instellingen.data && !instellingen.data.emailIngesteld;

  return (
    <SidebarProvider>
      <Sidebar className="border-r border-border" collapsible="icon">
        <SidebarHeader className="px-3 py-4">
          <Link
            to="/"
            className="font-display text-sm font-bold uppercase tracking-[0.3em] text-foreground group-data-[collapsible=icon]:hidden"
          >
            Barber
          </Link>
          <p className="mt-1 truncate text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
            {email ?? "Beheeromgeving"}
          </p>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminNav.map((item) => (
                  <SidebarMenuItem key={item.to}>
                    <SidebarMenuButton asChild isActive={pathname === item.to} tooltip={item.label}>
                      <Link to={item.to}>
                        <item.icon />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="gap-2 px-3 pb-4">
          <Button
            variant="outline"
            size="sm"
            disabled={uitloggen.isPending}
            className="w-full justify-start gap-2 rounded-lg group-data-[collapsible=icon]:justify-center"
            onClick={() => uitloggen.mutate()}
          >
            {uitloggen.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <LogOut className="size-4" />
            )}
            <span className="group-data-[collapsible=icon]:hidden">Uitloggen</span>
          </Button>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border px-4 sm:px-6">
          <SidebarTrigger />
          <span className="text-sm font-medium text-foreground">{activeLabel}</span>
        </header>

        {emailOntbreekt ? (
          <div className="flex flex-wrap items-center gap-3 border-b border-border bg-foreground px-4 py-3 text-background sm:px-6">
            <TriangleAlert className="size-4 shrink-0" />
            <p className="text-sm">
              Vul je e-mailadres in bij Instellingen — anders ontvang je geen melding van nieuwe
              boekingen.
            </p>
            <Link
              to="/admin/instellingen"
              className="ml-auto rounded-full bg-background px-4 py-1.5 text-xs font-semibold text-foreground transition-opacity hover:opacity-85"
            >
              Nu instellen
            </Link>
          </div>
        ) : null}

        <main className="flex-1 bg-muted/30 p-4 sm:p-8">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
