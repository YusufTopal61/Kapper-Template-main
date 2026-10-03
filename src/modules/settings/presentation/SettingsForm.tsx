"use client";

import { Check, Loader2, Mail, TriangleAlert } from "lucide-react";
import { Controller } from "react-hook-form";
import { Button } from "@/app/ui/button";
import { Input } from "@/app/ui/input";
import { Label } from "@/app/ui/label";
import { Switch } from "@/app/ui/switch";
import { cn } from "@/shared/lib/utils";
import { DAGEN } from "../domain/opening-hours.rules";
import type { AdminInstellingen, EmailStatus } from "../domain/settings.entity";
import { useSettingsForm } from "./useSettingsForm";

type SettingsFormProps = {
  instellingen: AdminInstellingen;
  emailStatus: EmailStatus;
};

export function SettingsForm({ instellingen, emailStatus }: SettingsFormProps) {
  const { form, fout, opgeslagen, bezig, verstuur, wisFout } = useSettingsForm(instellingen);
  const { register, control, watch, formState } = form;
  const { errors } = formState;

  const emailOntbreekt = !watch("admin_email")?.trim();
  const openingstijden = watch("openingstijden");

  return (
    <form onSubmit={verstuur} noValidate className="flex flex-col gap-6" onChange={wisFout}>
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Instellingen
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Bedrijfsgegevens en openingstijden. Deze gegevens sturen de boekingsflow en de e-mails
          aan.
        </p>
      </div>

      {emailOntbreekt ? (
        <div className="flex items-start gap-3 border border-foreground bg-foreground/5 px-4 py-3">
          <TriangleAlert className="mt-0.5 size-4 shrink-0 text-foreground" />
          <p className="text-sm text-foreground">
            <span className="font-semibold">Vul je e-mailadres in.</span> Zonder notificatie-adres
            ontvang je geen melding wanneer er een nieuwe afspraak binnenkomt.
          </p>
        </div>
      ) : null}

      {emailStatus.sandboxModus ? (
        <div className="flex items-start gap-3 border border-destructive/40 bg-destructive/10 px-4 py-3">
          <Mail className="mt-0.5 size-4 shrink-0 text-destructive" />
          <div className="text-sm text-foreground">
            <p>
              <span className="font-semibold">E-mail staat in testmodus.</span>{" "}
              {emailStatus.geconfigureerd ? (
                <>
                  Klanten krijgen <span className="font-semibold">geen</span> bevestigings- of
                  annuleringsmail — Resend levert vanaf{" "}
                  <code className="rounded bg-muted px-1">{emailStatus.vanAdres}</code> alleen af
                  bij het adres van je eigen Resend-account. Alleen jij als beheerder ontvangt wel
                  mail.
                </>
              ) : (
                <>
                  Er is nog geen RESEND_API_KEY ingesteld — mails worden nu nergens naartoe
                  gestuurd.
                </>
              )}
            </p>
            <p className="mt-2">
              Verifieer een domein op{" "}
              <a
                href="https://resend.com/domains"
                target="_blank"
                rel="noreferrer"
                className="font-semibold underline underline-offset-2"
              >
                resend.com/domains
              </a>{" "}
              en zet <code className="rounded bg-muted px-1">RESEND_FROM</code> op een adres van dat
              domein om klanten écht te bereiken.
            </p>
          </div>
        </div>
      ) : null}

      <section className="border border-border bg-card p-5 sm:p-6">
        <h2 className="font-display text-lg font-bold tracking-tight text-foreground">
          Bedrijfsgegevens
        </h2>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <Label htmlFor="bedrijfsnaam">Bedrijfsnaam</Label>
            <Input
              id="bedrijfsnaam"
              className="rounded-none"
              placeholder="Barber"
              aria-invalid={Boolean(errors.bedrijfsnaam)}
              {...register("bedrijfsnaam")}
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="admin_email">
              E-mailadres voor notificaties
              {emailOntbreekt ? <span className="ml-1 text-destructive">*</span> : null}
            </Label>
            <Input
              id="admin_email"
              type="email"
              className="rounded-none"
              placeholder="jij@jouwzaak.nl"
              aria-invalid={Boolean(errors.admin_email)}
              {...register("admin_email")}
            />
            <p className="text-xs text-muted-foreground">
              Hier komen nieuwe boekingen en annuleringen binnen.
            </p>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="telefoonnummer">Telefoonnummer</Label>
            <Input
              id="telefoonnummer"
              type="tel"
              className="rounded-none"
              placeholder="06 00 00 00 00"
              {...register("telefoonnummer")}
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="adres">Adres</Label>
            <Input
              id="adres"
              className="rounded-none"
              placeholder="Straatnaam 00, 0000 AA Plaatsnaam"
              {...register("adres")}
            />
          </div>
        </div>
      </section>

      <section className="border border-border bg-card p-5 sm:p-6">
        <h2 className="font-display text-lg font-bold tracking-tight text-foreground">
          Openingstijden
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Buiten deze tijden kan niemand een afspraak boeken.
        </p>

        <div className="mt-5 flex flex-col divide-y divide-border border-y border-border">
          {DAGEN.map((dag) => {
            const open = openingstijden[dag].open;
            return (
              <div
                key={dag}
                className="flex flex-wrap items-center gap-x-4 gap-y-3 py-3 sm:flex-nowrap"
              >
                <span className="w-28 text-sm font-semibold capitalize text-foreground">{dag}</span>

                <div className="flex items-center gap-2">
                  <Controller
                    control={control}
                    name={`openingstijden.${dag}.open`}
                    render={({ field }) => (
                      <Switch
                        id={`open-${dag}`}
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                  <Label htmlFor={`open-${dag}`} className="text-xs text-muted-foreground">
                    {open ? "Open" : "Gesloten"}
                  </Label>
                </div>

                {/* readOnly in plaats van disabled: een disabled veld levert geen waarde aan het formulier. */}
                <div className={cn("ml-auto flex items-center gap-2", !open && "opacity-50")}>
                  <Input
                    type="time"
                    aria-label={`Openingstijd ${dag}`}
                    readOnly={!open}
                    tabIndex={open ? 0 : -1}
                    className="w-[7.5rem] rounded-none"
                    {...register(`openingstijden.${dag}.van`)}
                  />
                  <span className="text-xs text-muted-foreground">tot</span>
                  <Input
                    type="time"
                    aria-label={`Sluitingstijd ${dag}`}
                    readOnly={!open}
                    tabIndex={open ? 0 : -1}
                    className="w-[7.5rem] rounded-none"
                    {...register(`openingstijden.${dag}.tot`)}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {fout ? (
        <p
          role="alert"
          className="flex items-start gap-2 border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          <TriangleAlert className="mt-0.5 size-4 shrink-0" />
          {fout}
        </p>
      ) : null}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={bezig} className="gap-2 rounded-none">
          {bezig ? <Loader2 className="size-4 animate-spin" /> : null}
          Opslaan
        </Button>
        {opgeslagen ? (
          <span role="status" className="flex items-center gap-1.5 text-sm text-foreground">
            <Check className="size-4" />
            Opgeslagen
          </span>
        ) : null}
      </div>
    </form>
  );
}
