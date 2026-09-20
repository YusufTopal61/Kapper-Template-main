import { useState } from "react";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { Loader2, Lock, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn } from "@/api/auth";

export const Route = createFileRoute("/admin/login")({
  head: () => ({
    meta: [{ title: "Inloggen — Beheer" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: LoginPagina,
});

function LoginPagina() {
  const router = useRouter();
  const { sessie } = Route.useRouteContext();
  const [email, setEmail] = useState("");
  const [wachtwoord, setWachtwoord] = useState("");
  const [fout, setFout] = useState<string | null>(null);

  const inloggen = useMutation({
    mutationFn: signIn,
    onSuccess: async (resultaat) => {
      if (!resultaat.ok) {
        setFout(resultaat.error);
        return;
      }
      // Opnieuw laden zodat beforeLoad de verse sessie ziet.
      await router.invalidate();
      await router.navigate({ to: "/admin" });
    },
    onError: () => setFout("Inloggen mislukte. Probeer het zo nog eens."),
  });

  if (!sessie.supabaseGeconfigureerd) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-lift">
          <div className="flex size-11 items-center justify-center rounded-full bg-foreground text-background">
            <TriangleAlert className="size-4" />
          </div>
          <h1 className="mt-6 font-display text-2xl font-bold tracking-tight text-foreground">
            Supabase nog niet gekoppeld
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Kopieer <code className="rounded bg-muted px-1 text-foreground">.env.example</code> naar{" "}
            <code className="rounded bg-muted px-1 text-foreground">.env.local</code> en vul je
            Supabase-gegevens in. Draai daarna de migraties uit{" "}
            <code className="rounded bg-muted px-1 text-foreground">supabase/migrations</code> en
            start de dev-server opnieuw.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setFout(null);
          inloggen.mutate({ data: { email, password: wachtwoord } });
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
          Log in met je beheerdersaccount om je agenda en diensten te beheren.
        </p>

        <div className="mt-6 grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="email">E-mailadres</Label>
            <Input
              id="email"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setFout(null);
              }}
              placeholder="naam@voorbeeld.nl"
              className="rounded-lg"
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="wachtwoord">Wachtwoord</Label>
            <Input
              id="wachtwoord"
              type="password"
              autoComplete="current-password"
              required
              value={wachtwoord}
              onChange={(e) => {
                setWachtwoord(e.target.value);
                setFout(null);
              }}
              placeholder="••••••••"
              className="rounded-lg"
            />
          </div>
        </div>

        {fout ? (
          <p className="mt-4 flex items-start gap-2 rounded-lg bg-destructive/10 px-3 py-2.5 text-xs text-destructive">
            <TriangleAlert className="mt-0.5 size-3.5 shrink-0" />
            {fout}
          </p>
        ) : null}

        <Button
          type="submit"
          disabled={inloggen.isPending}
          className="mt-6 w-full gap-2 rounded-lg"
        >
          {inloggen.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
          Inloggen
        </Button>
      </form>
    </div>
  );
}
