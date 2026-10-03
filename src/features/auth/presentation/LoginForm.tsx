"use client";

import { Loader2, Lock, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLoginForm } from "./use-login-form";

/** Het inlogscherm van het beheerpaneel. */
export function LoginForm({ supabaseConfigured }: { supabaseConfigured: boolean }) {
  const { form, error, isPending, submit, clearError } = useLoginForm();
  const { register, formState } = form;

  if (!supabaseConfigured) {
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
        onSubmit={submit}
        noValidate
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
              placeholder="naam@voorbeeld.nl"
              className="rounded-lg"
              aria-invalid={Boolean(formState.errors.email)}
              {...register("email", { onChange: clearError })}
            />
            {formState.errors.email ? (
              <p className="text-xs text-destructive">{formState.errors.email.message}</p>
            ) : null}
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="password">Wachtwoord</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              className="rounded-lg"
              aria-invalid={Boolean(formState.errors.password)}
              {...register("password", { onChange: clearError })}
            />
            {formState.errors.password ? (
              <p className="text-xs text-destructive">{formState.errors.password.message}</p>
            ) : null}
          </div>
        </div>

        {error ? (
          <p className="mt-4 flex items-start gap-2 rounded-lg bg-destructive/10 px-3 py-2.5 text-xs text-destructive">
            <TriangleAlert className="mt-0.5 size-3.5 shrink-0" />
            {error}
          </p>
        ) : null}

        <Button type="submit" disabled={isPending} className="mt-6 w-full gap-2 rounded-lg">
          {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
          Inloggen
        </Button>
      </form>
    </div>
  );
}
