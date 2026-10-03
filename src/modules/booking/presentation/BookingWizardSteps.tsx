"use client";

import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { Loader2 } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
import { cn } from "@/shared/lib/utils";
import { parseDatum } from "@/modules/settings/domain/opening-hours.rules";
import type { ServiceUIModel } from "@/modules/services/presentation/service.uimodel";
import type { Tijdslot } from "../domain/booking.entity";
import type { BookingKlantInput } from "../domain/booking.schema";

export function DienstStap({
  geconfigureerd,
  diensten,
  gekozen,
  onKies,
}: {
  geconfigureerd: boolean;
  diensten: ServiceUIModel[];
  gekozen: string | null;
  onKies: (id: string) => void;
}) {
  if (!geconfigureerd) {
    return (
      <Melding>
        Online boeken is nog niet geactiveerd. Zet de Supabase-gegevens in{" "}
        <code className="rounded bg-muted px-1">.env.local</code> om dit formulier live te zetten.
      </Melding>
    );
  }

  if (diensten.length === 0) {
    return <Melding>Er zijn op dit moment geen diensten beschikbaar.</Melding>;
  }

  return (
    <div className="grid gap-3">
      {diensten.map((dienst) => (
        <button
          key={dienst.id}
          type="button"
          onClick={() => onKies(dienst.id)}
          aria-pressed={gekozen === dienst.id}
          className={cn(
            "flex items-center justify-between rounded-2xl border px-5 py-4 text-left transition-all duration-200 hover:-translate-y-0.5",
            gekozen === dienst.id
              ? "border-accent bg-accent-soft"
              : "border-border bg-card hover:bg-muted",
          )}
        >
          <span>
            <span className="block font-semibold">{dienst.naam}</span>
            <span className="text-xs text-muted-foreground">{dienst.duurLabel}</span>
          </span>
          <span className="text-sm text-muted-foreground">{dienst.prijsLabel}</span>
        </button>
      ))}
    </div>
  );
}

export function DatumStap({
  dagen,
  datum,
  tijd,
  onKiesDatum,
  onKiesTijd,
  sloten,
  slotenLaden,
  slotenFout,
  gesloten,
}: {
  dagen: string[];
  datum: string | null;
  tijd: string | null;
  onKiesDatum: (datum: string) => void;
  onKiesTijd: (tijd: string) => void;
  sloten: Tijdslot[];
  slotenLaden: boolean;
  slotenFout: boolean;
  gesloten: boolean;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        Kies een dag
      </p>
      <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">
        {dagen.map((dag) => {
          const datumObject = parseDatum(dag);
          return (
            <button
              key={dag}
              type="button"
              onClick={() => onKiesDatum(dag)}
              aria-pressed={datum === dag}
              className={cn(
                "rounded-xl border px-2 py-3 text-sm font-semibold capitalize transition-colors",
                datum === dag
                  ? "border-accent bg-accent text-accent-foreground"
                  : "border-border hover:bg-muted",
              )}
            >
              {format(datumObject, "EEEEEE", { locale: nl })} {format(datumObject, "dd")}
            </button>
          );
        })}
      </div>

      <p className="mt-6 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        Kies een tijd
      </p>

      {!datum ? (
        <p className="mt-3 text-sm text-muted-foreground">Kies eerst een dag.</p>
      ) : slotenLaden ? (
        <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Beschikbaarheid ophalen…
        </div>
      ) : slotenFout ? (
        <p className="mt-3 text-sm text-destructive">
          De beschikbaarheid kon niet worden opgehaald. Kies de dag opnieuw om het nog eens te
          proberen.
        </p>
      ) : gesloten || sloten.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">
          Op deze dag zijn geen tijden beschikbaar. Kies een andere dag.
        </p>
      ) : (
        <div className="mt-3 flex flex-wrap gap-2">
          {sloten.map((slot) => (
            <button
              key={slot.tijd}
              type="button"
              disabled={!slot.beschikbaar}
              onClick={() => onKiesTijd(slot.tijd)}
              aria-pressed={tijd === slot.tijd}
              title={slot.beschikbaar ? undefined : "Dit tijdslot is bezet"}
              className={cn(
                "rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
                tijd === slot.tijd
                  ? "border-accent bg-accent text-accent-foreground"
                  : slot.beschikbaar
                    ? "border-border hover:bg-muted"
                    : "cursor-not-allowed border-border/60 text-muted-foreground/50 line-through",
              )}
            >
              {slot.tijd}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function GegevensStap({
  form,
  samenvatting,
}: {
  form: UseFormReturn<BookingKlantInput>;
  samenvatting: { dienst: string; datum: string | null; tijd: string | null };
}) {
  const { register, formState } = form;
  const { errors } = formState;

  return (
    <div className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Veld
          label="Naam"
          placeholder="Voor- en achternaam"
          autoComplete="name"
          fout={errors.klant_naam?.message}
          {...register("klant_naam")}
        />
        <Veld
          label="Telefoon"
          type="tel"
          placeholder="06 12 34 56 78"
          autoComplete="tel"
          fout={errors.klant_telefoon?.message}
          {...register("klant_telefoon")}
        />
      </div>
      <Veld
        label="E-mail"
        type="email"
        placeholder="naam@voorbeeld.nl"
        autoComplete="email"
        fout={errors.klant_email?.message}
        {...register("klant_email")}
      />
      <div className="rounded-2xl bg-muted px-5 py-4 text-sm text-muted-foreground">
        <span className="font-semibold text-foreground">{samenvatting.dienst}</span> ·{" "}
        {samenvatting.datum
          ? format(parseDatum(samenvatting.datum), "d MMMM", { locale: nl })
          : "datum"}{" "}
        · {samenvatting.tijd ?? "tijd"}
      </div>
    </div>
  );
}

type VeldProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  fout?: string | undefined;
};

function Veld({ label, fout, ref, ...invoer }: VeldProps & { ref?: React.Ref<HTMLInputElement> }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      <input
        ref={ref}
        aria-invalid={Boolean(fout)}
        className={cn(
          "mt-2 w-full rounded-xl border bg-card px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground/70",
          fout ? "border-destructive" : "border-input focus:border-accent",
        )}
        {...invoer}
      />
      {fout ? <span className="mt-1.5 block text-xs text-destructive">{fout}</span> : null}
    </label>
  );
}

export function Melding({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-border px-5 py-8 text-center text-sm text-muted-foreground">
      {children}
    </div>
  );
}
