import { useEffect, useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { CalendarDays, LayoutGrid, Lock, LogOut, Scissors } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/** Placeholder client-side gate. Not real auth — swap for a real login flow later. */
const ADMIN_PASSWORD = "kapper2026";
const AUTH_KEY = "admin_authenticated";

const adminNav = [
  { label: "Overzicht", to: "/admin", icon: LayoutGrid },
  { label: "Boekingen", to: "/admin/boekingen", icon: CalendarDays },
  { label: "Diensten", to: "/admin/diensten", icon: Scissors },
] as const;

export function AdminShell({ children }: { children: ReactNode }) {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    setAuthed(window.localStorage.getItem(AUTH_KEY) === "true");
  }, []);

  if (authed === null) {
    return <div className="min-h-screen bg-background" />;
  }

  if (!authed) {
    return <AdminLogin onSuccess={() => setAuthed(true)} />;
  }

  const activeLabel = adminNav.find((n) => n.to === pathname)?.label ?? "Beheer";

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
          <p className="mt-1 text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
            Beheeromgeving
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
            className="w-full justify-start gap-2 rounded-lg group-data-[collapsible=icon]:justify-center"
            onClick={() => {
              window.localStorage.removeItem(AUTH_KEY);
              setAuthed(false);
            }}
          >
            <LogOut className="size-4" />
            <span className="group-data-[collapsible=icon]:hidden">Uitloggen</span>
          </Button>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border px-4 sm:px-6">
          <SidebarTrigger />
          <span className="text-sm font-medium text-foreground">{activeLabel}</span>
        </header>
        <main className="flex-1 bg-muted/30 p-4 sm:p-8">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}

function AdminLogin({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (password === ADMIN_PASSWORD) {
            window.localStorage.setItem(AUTH_KEY, "true");
            onSuccess();
          } else {
            setError(true);
          }
        }}
        className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 shadow-lift"
      >
        <div className="flex size-11 items-center justify-center rounded-full bg-foreground text-background">
          <Lock className="size-4" />
        </div>
        <h1 className="mt-6 font-display text-2xl font-bold tracking-tight text-foreground">
          Beheeromgeving
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Alleen voor de eigenaar. Voer het wachtwoord in om door te gaan.
        </p>

        <div className="mt-6 grid gap-1.5">
          <Label htmlFor="admin-password">Wachtwoord</Label>
          <Input
            id="admin-password"
            type="password"
            autoFocus
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError(false);
            }}
            placeholder="••••••••"
            className="rounded-lg"
          />
          {error ? (
            <p className="text-xs text-destructive">Onjuist wachtwoord. Probeer opnieuw.</p>
          ) : null}
        </div>

        <Button type="submit" className="mt-6 w-full rounded-lg">
          Inloggen
        </Button>

        <p className="mt-4 text-center text-[11px] leading-relaxed text-muted-foreground">
          Demo-wachtwoord:{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-foreground">{ADMIN_PASSWORD}</code> —
          vervang dit door echte authenticatie voordat dit live gaat.
        </p>
      </form>
    </div>
  );
}
