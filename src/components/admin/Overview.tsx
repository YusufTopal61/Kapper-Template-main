import { Link } from "@tanstack/react-router";
import { format, isFuture, isToday, parseISO } from "date-fns";
import { nl } from "date-fns/locale";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { initialBookings, type BookingStatus } from "@/lib/admin-data";
import { services } from "@/lib/site-data";

const statusVariant: Record<BookingStatus, "default" | "secondary" | "destructive"> = {
  bevestigd: "default",
  voltooid: "secondary",
  geannuleerd: "destructive",
};

export function Overview() {
  const bevestigd = initialBookings.filter((b) => b.status === "bevestigd").length;
  const voltooid = initialBookings.filter((b) => b.status === "voltooid").length;
  const geannuleerd = initialBookings.filter((b) => b.status === "geannuleerd").length;

  const upcoming = initialBookings
    .filter(
      (b) =>
        b.status === "bevestigd" && (isToday(parseISO(b.datum)) || isFuture(parseISO(b.datum))),
    )
    .sort((a, b) => (a.datum + a.tijd).localeCompare(b.datum + b.tijd))
    .slice(0, 5);

  const stats = [
    { label: "Bevestigd", value: bevestigd },
    { label: "Voltooid", value: voltooid },
    { label: "Geannuleerd", value: geannuleerd },
    { label: "Diensten", value: services.length },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Overzicht
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Een snelle blik op de zaak. Alles hieronder is mock-data.
        </p>
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
            to="/admin/boekingen"
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
                  <p className="text-sm font-semibold text-foreground">{booking.klantnaam}</p>
                  <p className="text-xs text-muted-foreground">
                    {booking.dienst} · {format(parseISO(booking.datum), "d MMM", { locale: nl })} ·{" "}
                    {booking.tijd}
                  </p>
                </div>
                <Badge variant={statusVariant[booking.status]} className="rounded-full capitalize">
                  {booking.status}
                </Badge>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
