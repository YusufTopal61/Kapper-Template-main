"use client";

import { useTransition, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  CalendarDays,
  LayoutGrid,
  Loader2,
  LogOut,
  Mail,
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
import { signOutAction } from "@/features/auth/presentation/auth.actions";
import { siteConfig } from "@/config/site";

const adminNav = [
  { label: "Overzicht", href: "/admin", icon: LayoutGrid },
  { label: "Boekingen", href: "/admin/boekingen", icon: CalendarDays },
  { label: "Diensten", href: "/admin/diensten", icon: Scissors },
  { label: "Instellingen", href: "/admin/instellingen", icon: Settings },
] as const;

type AdminShellProps = {
  children: ReactNode;
  email: string | null;
  /** Is a notification address configured? If not, we show a notice. */
  emailConfigured: boolean;
  /** Is the mail provider still in test mode (customers then get no mail)? */
  emailSandbox: boolean;
};

export function AdminShell({ children, email, emailConfigured, emailSandbox }: AdminShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [signingOut, startTransition] = useTransition();

  function handleSignOut() {
    startTransition(async () => {
      await signOutAction();
      router.replace("/admin/login");
      router.refresh();
    });
  }

  const activeLabel = adminNav.find((n) => n.href === pathname)?.label ?? "Beheer";

  return (
    <SidebarProvider>
      <Sidebar className="border-r border-border" collapsible="icon">
        <SidebarHeader className="px-3 py-4">
          <Link
            href="/"
            className="font-display text-sm font-bold uppercase tracking-[0.3em] text-foreground group-data-[collapsible=icon]:hidden"
          >
            {siteConfig.brandName}
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
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.href}
                      tooltip={item.label}
                    >
                      <Link href={item.href}>
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
            disabled={signingOut}
            className="w-full justify-start gap-2 rounded-lg group-data-[collapsible=icon]:justify-center"
            onClick={handleSignOut}
          >
            {signingOut ? (
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

        {!emailConfigured ? (
          <div className="flex flex-wrap items-center gap-3 border-b border-border bg-foreground px-4 py-3 text-background sm:px-6">
            <TriangleAlert className="size-4 shrink-0" />
            <p className="text-sm">
              Vul je e-mailadres in bij Instellingen — anders ontvang je geen melding van nieuwe
              boekingen.
            </p>
            <Link
              href="/admin/instellingen"
              className="ml-auto rounded-full bg-background px-4 py-1.5 text-xs font-semibold text-foreground transition-opacity hover:opacity-85"
            >
              Nu instellen
            </Link>
          </div>
        ) : null}

        {emailSandbox ? (
          <div className="flex flex-wrap items-center gap-3 border-b border-border bg-destructive px-4 py-3 text-destructive-foreground sm:px-6">
            <Mail className="size-4 shrink-0" />
            <p className="text-sm">
              E-mail staat in testmodus:{" "}
              <span className="font-semibold">klanten krijgen geen bevestigingsmail.</span>{" "}
              Verifieer een domein bij Resend om dit op te lossen.
            </p>
            <Link
              href="/admin/instellingen"
              className="ml-auto rounded-full bg-background px-4 py-1.5 text-xs font-semibold text-foreground transition-opacity hover:opacity-85"
            >
              Meer info
            </Link>
          </div>
        ) : null}

        <main className="flex-1 bg-muted/30 p-4 sm:p-8">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
