import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { BookingUIModel } from "@/features/booking/presentation/booking.ui-model";
import { formatDateShorter } from "@/features/booking/presentation/booking.ui-model";

type OverviewProps = {
  confirmed: number;
  completed: number;
  cancelled: number;
  activeServices: number;
  upcoming: BookingUIModel[];
};

/** Snelle blik op de zaak. Server Component: de cijfers komen kant-en-klaar binnen. */
export function Overview({
  confirmed,
  completed,
  cancelled,
  activeServices,
  upcoming,
}: OverviewProps) {
  const stats = [
    { label: "Bevestigd", value: confirmed },
    { label: "Voltooid", value: completed },
    { label: "Geannuleerd", value: cancelled },
    { label: "Actieve diensten", value: activeServices },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Overzicht
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">Een snelle blik op de zaak.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-border bg-card p-5 shadow-soft"
          >
            <p className="font-display text-3xl font-bold tracking-tight text-foreground">
              {stat.value}
            </p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 shadow-soft sm:p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold tracking-tight text-foreground">
            Eerstvolgende afspraken
          </h2>
          <Link
            href="/admin/boekingen"
            className="inline-flex items-center gap-1 text-sm font-medium text-foreground transition-opacity hover:opacity-70"
          >
            Alle boekingen
            <ArrowRight className="size-3.5" />
          </Link>
        </div>

        <div className="mt-4 flex flex-col gap-2">
          {upcoming.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Geen aankomende afspraken.
            </p>
          ) : (
            upcoming.map((booking) => (
              <div
                key={booking.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border px-4 py-3"
              >
                <div>
                  <p className="text-sm font-semibold text-foreground">{booking.customerName}</p>
                  <p className="text-xs text-muted-foreground">
                    {booking.serviceName} · {formatDateShorter(booking.date)} · {booking.time}
                  </p>
                </div>
                <Badge variant={booking.statusVariant} className="rounded-full">
                  {booking.statusLabel}
                </Badge>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
