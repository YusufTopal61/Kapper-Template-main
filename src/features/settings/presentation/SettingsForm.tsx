"use client";

import { Check, Loader2, Mail, TriangleAlert } from "lucide-react";
import { Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils/cn";
import { WEEKDAY_LABELS, WEEKDAYS } from "../domain/opening-hours.rules";
import type { AdminSettings, EmailStatus } from "../domain/settings.entity";
import { useSettingsForm } from "./use-settings-form";

type SettingsFormProps = {
  settings: AdminSettings;
  emailStatus: EmailStatus;
};

export function SettingsForm({ settings, emailStatus }: SettingsFormProps) {
  const { form, error, saved, isPending, submit, clearError } = useSettingsForm(settings);
  const { register, control, watch, formState } = form;
  const { errors } = formState;

  const emailMissing = !watch("adminEmail")?.trim();
  const openingHours = watch("openingHours");

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-6" onChange={clearError}>
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Instellingen
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Bedrijfsgegevens en openingstijden. Deze gegevens sturen de boekingsflow en de e-mails
          aan.
        </p>
      </div>

      {emailMissing ? (
        <div className="flex items-start gap-3 border border-foreground bg-foreground/5 px-4 py-3">
          <TriangleAlert className="mt-0.5 size-4 shrink-0 text-foreground" />
          <p className="text-sm text-foreground">
            <span className="font-semibold">Vul je e-mailadres in.</span> Zonder notificatie-adres
            ontvang je geen melding wanneer er een nieuwe afspraak binnenkomt.
          </p>
        </div>
      ) : null}

      {emailStatus.sandboxMode ? (
        <div className="flex items-start gap-3 border border-destructive/40 bg-destructive/10 px-4 py-3">
          <Mail className="mt-0.5 size-4 shrink-0 text-destructive" />
          <div className="text-sm text-foreground">
            <p>
              <span className="font-semibold">E-mail staat in testmodus.</span>{" "}
              {emailStatus.configured ? (
                <>
                  Klanten krijgen <span className="font-semibold">geen</span> bevestigings- of
                  annuleringsmail — Resend levert vanaf{" "}
                  <code className="rounded bg-muted px-1">{emailStatus.fromAddress}</code> alleen af
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
            <Label htmlFor="businessName">Bedrijfsnaam</Label>
            <Input
              id="businessName"
              className="rounded-none"
              placeholder="Barber"
              aria-invalid={Boolean(errors.businessName)}
              {...register("businessName")}
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="adminEmail">
              E-mailadres voor notificaties
              {emailMissing ? <span className="ml-1 text-destructive">*</span> : null}
            </Label>
            <Input
              id="adminEmail"
              type="email"
              className="rounded-none"
              placeholder="jij@jouwzaak.nl"
              aria-invalid={Boolean(errors.adminEmail)}
              {...register("adminEmail")}
            />
            <p className="text-xs text-muted-foreground">
              Hier komen nieuwe boekingen en annuleringen binnen.
            </p>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="phoneNumber">Telefoonnummer</Label>
            <Input
              id="phoneNumber"
              type="tel"
              className="rounded-none"
              placeholder="06 00 00 00 00"
              {...register("phoneNumber")}
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="address">Adres</Label>
            <Input
              id="address"
              className="rounded-none"
              placeholder="Straatnaam 00, 0000 AA Plaatsnaam"
              {...register("address")}
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
          {WEEKDAYS.map((day) => {
            const open = openingHours[day].open;
            return (
              <div
                key={day}
                className="flex flex-wrap items-center gap-x-4 gap-y-3 py-3 sm:flex-nowrap"
              >
                <span className="w-28 text-sm font-semibold capitalize text-foreground">
                  {WEEKDAY_LABELS[day]}
                </span>

                <div className="flex items-center gap-2">
                  <Controller
                    control={control}
                    name={`openingHours.${day}.open`}
                    render={({ field }) => (
                      <Switch
                        id={`open-${day}`}
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                  <Label htmlFor={`open-${day}`} className="text-xs text-muted-foreground">
                    {open ? "Open" : "Gesloten"}
                  </Label>
                </div>

                {/* readOnly instead of disabled: a disabled field delivers no value to the form. */}
                <div className={cn("ml-auto flex items-center gap-2", !open && "opacity-50")}>
                  <Input
                    type="time"
                    aria-label={`Openingstijd ${WEEKDAY_LABELS[day]}`}
                    readOnly={!open}
                    tabIndex={open ? 0 : -1}
                    className="w-[7.5rem] rounded-none"
                    {...register(`openingHours.${day}.from`)}
                  />
                  <span className="text-xs text-muted-foreground">tot</span>
                  <Input
                    type="time"
                    aria-label={`Sluitingstijd ${WEEKDAY_LABELS[day]}`}
                    readOnly={!open}
                    tabIndex={open ? 0 : -1}
                    className="w-[7.5rem] rounded-none"
                    {...register(`openingHours.${day}.to`)}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {error ? (
        <p
          role="alert"
          className="flex items-start gap-2 border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          <TriangleAlert className="mt-0.5 size-4 shrink-0" />
          {error}
        </p>
      ) : null}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isPending} className="gap-2 rounded-none">
          {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
          Opslaan
        </Button>
        {saved ? (
          <span role="status" className="flex items-center gap-1.5 text-sm text-foreground">
            <Check className="size-4" />
            Opgeslagen
          </span>
        ) : null}
      </div>
    </form>
  );
}
