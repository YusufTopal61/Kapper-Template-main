import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { format, isBefore, startOfToday } from "date-fns";
import { nl } from "date-fns/locale";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { fetchAdminBookings } from "@/api/bookings";
import { fetchAllServices } from "@/api/services";
import { normaliseerTijd, parseDatum } from "@/lib/opening-hours";
import type { BookingStatus } from "@/lib/supabase/types";

const statusVariant: Record<BookingStatus, "default" | "secondary" | "destructive" | "outline"> = {
  bevestigd: "default",
  voltooid: "secondary",
  geannuleerd: "destructive",
  no_show: "outline",
};

const statusLabel: Record<BookingStatus, string> = {
  bevestigd: "Bevestigd",
  voltooid: "Voltooid",
  geannuleerd: "Geannuleerd",
  no_show: "No-show",
};

export function Overview() {
  const boekingen = useQuery({
    queryKey: ["bookings"],
    queryFn: () => fetchAdminBookings(),
  });

  const diensten = useQuery({
    queryKey: ["services", "alle"],
    queryFn: () => fetchAllServices(),
  });

  const lijst = boekingen.data ?? [];
  const vandaag = startOfToday();

  const aankomend = lijst
    .filter((b) => b.status === "bevestigd" && !isBefore(parseDatum(b.datum), vandaag))
    .slice(0, 5);

  const stats = [
    { label: "Bevestigd", waarde: lijst.filter((b) => b.status === "bevestigd").length },
    { label: "Voltooid", waarde: lijst.filter((b) => b.status === "voltooid").length },
    { label: "Geannuleerd", waarde: lijst.filter((b) => b.status === "geannuleerd").length },
    { label: "Actieve diensten", waarde: (diensten.data ?? []).filter((d) => d.actief).length },
  ];

  const laden = boekingen.isLoading || diensten.isLoading;

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
            {laden ? (
              <div className="h-9 w-12 animate-pulse rounded bg-muted" />
            ) : (
              <p className="font-display text-3xl font-bold tracking-tight text-foreground">
                {stat.waarde}
              </p>
            )}
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
          {laden ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-xl bg-muted" />
            ))
          ) : boekingen.isError ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              De boekingen konden niet geladen worden.
            </p>
          ) : aankomend.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Geen aankomende afspraken.
            </p>
          ) : (
            aankomend.map((boeking) => (
              <div
                key={boeking.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border px-4 py-3"
              >
                <div>
                  <p className="text-sm font-semibold text-foreground">{boeking.klant_naam}</p>
                  <p className="text-xs text-muted-foreground">
                    {boeking.services?.naam ?? "—"} ·{" "}
                    {format(parseDatum(boeking.datum), "d MMM", { locale: nl })} ·{" "}
                    {normaliseerTijd(boeking.tijd)}
                  </p>
                </div>
                <Badge variant={statusVariant[boeking.status]} className="rounded-full">
                  {statusLabel[boeking.status]}
                </Badge>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
