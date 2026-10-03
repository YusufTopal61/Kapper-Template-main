"use client";

import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { Loader2 } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
import { cn } from "@/lib/utils/cn";
import { parseDate } from "@/features/settings/domain/opening-hours.rules";
import type { ServiceUIModel } from "@/features/services/presentation/service.ui-model";
import type { TimeSlot } from "../domain/booking.entity";
import type { BookingCustomerInput } from "../domain/booking.schema";

export function ServiceStep({
  configured,
  services,
  selected,
  onSelect,
}: {
  configured: boolean;
  services: ServiceUIModel[];
  selected: string | null;
  onSelect: (id: string) => void;
}) {
  if (!configured) {
    return (
      <Notice>
        Online boeken is nog niet geactiveerd. Zet de Supabase-gegevens in{" "}
        <code className="rounded bg-muted px-1">.env.local</code> om dit formulier live te zetten.
      </Notice>
    );
  }

  if (services.length === 0) {
    return <Notice>Er zijn op dit moment geen diensten beschikbaar.</Notice>;
  }

  return (
    <div className="grid gap-3">
      {services.map((service) => (
        <button
          key={service.id}
          type="button"
          onClick={() => onSelect(service.id)}
          aria-pressed={selected === service.id}
          className={cn(
            "flex items-center justify-between rounded-2xl border px-5 py-4 text-left transition-all duration-200 hover:-translate-y-0.5",
            selected === service.id
              ? "border-accent bg-accent-soft"
              : "border-border bg-card hover:bg-muted",
          )}
        >
          <span>
            <span className="block font-semibold">{service.name}</span>
            <span className="text-xs text-muted-foreground">{service.durationLabel}</span>
          </span>
          <span className="text-sm text-muted-foreground">{service.priceLabel}</span>
        </button>
      ))}
    </div>
  );
}

export function DateStep({
  days,
  date,
  time,
  onSelectDate,
  onSelectTime,
  slots,
  slotsLoading,
  slotsError,
  closed,
}: {
  days: string[];
  date: string | null;
  time: string | null;
  onSelectDate: (date: string) => void;
  onSelectTime: (time: string) => void;
  slots: TimeSlot[];
  slotsLoading: boolean;
  slotsError: boolean;
  closed: boolean;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        Kies een dag
      </p>
      <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">
        {days.map((day) => {
          const dateObject = parseDate(day);
          return (
            <button
              key={day}
              type="button"
              onClick={() => onSelectDate(day)}
              aria-pressed={date === day}
              className={cn(
                "rounded-xl border px-2 py-3 text-sm font-semibold capitalize transition-colors",
                date === day
                  ? "border-accent bg-accent text-accent-foreground"
                  : "border-border hover:bg-muted",
              )}
            >
              {format(dateObject, "EEEEEE", { locale: nl })} {format(dateObject, "dd")}
            </button>
          );
        })}
      </div>

      <p className="mt-6 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        Kies een tijd
      </p>

      {!date ? (
        <p className="mt-3 text-sm text-muted-foreground">Kies eerst een dag.</p>
      ) : slotsLoading ? (
        <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Beschikbaarheid ophalen…
        </div>
      ) : slotsError ? (
        <p className="mt-3 text-sm text-destructive">
          De beschikbaarheid kon niet worden opgehaald. Kies de dag opnieuw om het nog eens te
          proberen.
        </p>
      ) : closed || slots.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">
          Op deze dag zijn geen tijden beschikbaar. Kies een andere dag.
        </p>
      ) : (
        <div className="mt-3 flex flex-wrap gap-2">
          {slots.map((slot) => (
            <button
              key={slot.time}
              type="button"
              disabled={!slot.available}
              onClick={() => onSelectTime(slot.time)}
              aria-pressed={time === slot.time}
              title={slot.available ? undefined : "Dit tijdslot is bezet"}
              className={cn(
                "rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
                time === slot.time
                  ? "border-accent bg-accent text-accent-foreground"
                  : slot.available
                    ? "border-border hover:bg-muted"
                    : "cursor-not-allowed border-border/60 text-muted-foreground/50 line-through",
              )}
            >
              {slot.time}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function DetailsStep({
  form,
  summary,
}: {
  form: UseFormReturn<BookingCustomerInput>;
  summary: { service: string; date: string | null; time: string | null };
}) {
  const { register, formState } = form;
  const { errors } = formState;

  return (
    <div className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Naam"
          placeholder="Voor- en achternaam"
          autoComplete="name"
          error={errors.customerName?.message}
          {...register("customerName")}
        />
        <Field
          label="Telefoon"
          type="tel"
          placeholder="06 12 34 56 78"
          autoComplete="tel"
          error={errors.customerPhone?.message}
          {...register("customerPhone")}
        />
      </div>
      <Field
        label="E-mail"
        type="email"
        placeholder="naam@voorbeeld.nl"
        autoComplete="email"
        error={errors.customerEmail?.message}
        {...register("customerEmail")}
      />
      <div className="rounded-2xl bg-muted px-5 py-4 text-sm text-muted-foreground">
        <span className="font-semibold text-foreground">{summary.service}</span> ·{" "}
        {summary.date ? format(parseDate(summary.date), "d MMMM", { locale: nl }) : "–"} ·{" "}
        {summary.time ?? "–"}
      </div>
    </div>
  );
}

type FieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string | undefined;
};

function Field({
  label,
  error,
  ref,
  ...input
}: FieldProps & { ref?: React.Ref<HTMLInputElement> }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      <input
        ref={ref}
        aria-invalid={Boolean(error)}
        className={cn(
          "mt-2 w-full rounded-xl border bg-card px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground/70",
          error ? "border-destructive" : "border-input focus:border-accent",
        )}
        {...input}
      />
      {error ? <span className="mt-1.5 block text-xs text-destructive">{error}</span> : null}
    </label>
  );
}

export function Notice({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-border px-5 py-8 text-center text-sm text-muted-foreground">
      {children}
    </div>
  );
}
