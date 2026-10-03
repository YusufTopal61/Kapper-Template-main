"use client";

import Link from "next/link";
import { CalendarX2, Check, Loader2, TriangleAlert } from "lucide-react";
import type { BookingByToken } from "../domain/booking.entity";
import { formatDateLong } from "./booking.ui-model";
import { useCancelBooking } from "./use-cancel-booking";

export type CancelLoadResult = { ok: true; booking: BookingByToken } | { ok: false; error: string };

/** De kaart op de annuleerpagina: toont de afspraak en laat de klant bevestigen. */
export function CancelBookingView({
  result,
  bookingId,
  token,
}: {
  result: CancelLoadResult;
  bookingId: string;
  token: string;
}) {
  const { cancelled, error, isPending, cancel } = useCancelBooking(bookingId, token);

  return (
    <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 shadow-lift">
      {!result.ok ? (
        <StatusPanel
          icon={<TriangleAlert className="size-6" />}
          title="Link niet geldig"
          text={result.error}
        />
      ) : cancelled ? (
        <StatusPanel
          icon={<Check className="size-6" />}
          title="Afspraak geannuleerd"
          text="Je afspraak is geannuleerd en het tijdslot is weer vrij. Je krijgt hiervan een bevestiging per mail."
        />
      ) : result.booking.status === "cancelled" ? (
        <StatusPanel
          icon={<CalendarX2 className="size-6" />}
          title="Al geannuleerd"
          text="Deze afspraak is eerder al geannuleerd. Er staat niets meer voor je ingepland."
        />
      ) : (
        <>
          <div className="flex size-12 items-center justify-center rounded-full bg-foreground text-background">
            <CalendarX2 className="size-5" />
          </div>
          <h1 className="mt-6 font-display text-2xl font-bold tracking-tight text-foreground">
            Afspraak annuleren
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Hoi {result.booking.customerName}, dit staat er voor je gepland. Weet je zeker dat je
            wilt annuleren?
          </p>

          <dl className="mt-6 divide-y divide-border border-y border-border">
            {[
              ["Dienst", result.booking.serviceName],
              ["Datum", formatDateLong(result.booking.date)],
              ["Tijd", result.booking.time],
              ...(result.booking.address ? [["Adres", result.booking.address]] : []),
            ].map(([label, value]) => (
              <div key={label} className="flex items-baseline justify-between gap-4 py-3">
                <dt className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  {label}
                </dt>
                <dd className="text-right text-sm font-semibold text-foreground first-letter:uppercase">
                  {value}
                </dd>
              </div>
            ))}
          </dl>

          {error ? (
            <p className="mt-4 flex items-start gap-2 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
              <TriangleAlert className="mt-0.5 size-4 shrink-0" />
              {error}
            </p>
          ) : null}

          <div className="mt-7 flex flex-col gap-2">
            <button
              type="button"
              disabled={isPending}
              onClick={cancel}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background transition-opacity hover:opacity-85 disabled:opacity-50"
            >
              {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
              Annuleer afspraak
            </button>
            <Link
              href="/"
              className="rounded-full px-6 py-3 text-center text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Nee, laat maar staan
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

function StatusPanel({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="text-center">
      <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-foreground text-background">
        {icon}
      </div>
      <h1 className="mt-6 font-display text-2xl font-bold tracking-tight text-foreground">
        {title}
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text}</p>
      <div className="mt-7 flex flex-col gap-2">
        <Link
          href="/boeken"
          className="rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background transition-opacity hover:opacity-85"
        >
          Nieuwe afspraak plannen
        </Link>
        <Link
          href="/"
          className="rounded-full px-6 py-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          Terug naar home
        </Link>
      </div>
    </div>
  );
}
