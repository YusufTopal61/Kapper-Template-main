import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { CalendarX2, Check, Loader2, TriangleAlert } from "lucide-react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { cancelBookingByToken, fetchBookingByToken, type BoekingViaToken } from "@/api/cancel";
import { parseDatum } from "@/lib/opening-hours";

const UUID_PATROON = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type LaadResultaat = { ok: true; boeking: BoekingViaToken } | { ok: false; error: string };

export const Route = createFileRoute("/boeking/annuleren/$bookingId")({
  head: () => ({
    meta: [
      { title: "Afspraak annuleren" },
      // Annuleerpagina's horen niet in zoekmachines.
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  validateSearch: (search: Record<string, unknown>) => ({
    token: typeof search["token"] === "string" ? search["token"] : "",
  }),
  loaderDeps: ({ search }) => ({ token: search.token }),
  loader: async ({ params, deps }): Promise<LaadResultaat> => {
    if (!deps.token || deps.token.length < 16 || !UUID_PATROON.test(params.bookingId)) {
      return { ok: false, error: "Deze annuleerlink is niet (meer) geldig." };
    }
    return fetchBookingByToken({
      data: { bookingId: params.bookingId, token: deps.token },
    });
  },
  component: AnnuleerPagina,
});

function AnnuleerPagina() {
  const resultaat = Route.useLoaderData();
  const { bookingId } = Route.useParams();
  const { token } = Route.useSearch();
  const [geannuleerd, setGeannuleerd] = useState(false);
  const [fout, setFout] = useState<string | null>(null);

  const annuleren = useMutation({
    mutationFn: cancelBookingByToken,
    onSuccess: (uitkomst) => {
      if (uitkomst.ok) setGeannuleerd(true);
      else setFout(uitkomst.error);
    },
    onError: () => setFout("Er ging iets mis. Probeer het zo nog eens."),
  });

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex flex-1 items-center justify-center px-5 pt-28 pb-20 sm:pt-32">
        <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 shadow-lift">
          {!resultaat.ok ? (
            <Toestand
              icoon={<TriangleAlert className="size-6" />}
              titel="Link niet geldig"
              tekst={resultaat.error}
            />
          ) : geannuleerd ? (
            <Toestand
              icoon={<Check className="size-6" />}
              titel="Afspraak geannuleerd"
              tekst="Je afspraak is geannuleerd en het tijdslot is weer vrij. Je krijgt hiervan een bevestiging per mail."
            />
          ) : resultaat.boeking.status === "geannuleerd" ? (
            <Toestand
              icoon={<CalendarX2 className="size-6" />}
              titel="Al geannuleerd"
              tekst="Deze afspraak is eerder al geannuleerd. Er staat niets meer voor je ingepland."
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
                Hoi {resultaat.boeking.klant_naam}, dit staat er voor je gepland. Weet je zeker dat
                je wilt annuleren?
              </p>

              <dl className="mt-6 divide-y divide-border border-y border-border">
                {[
                  ["Dienst", resultaat.boeking.dienstNaam],
                  [
                    "Datum",
                    format(parseDatum(resultaat.boeking.datum), "EEEE d MMMM yyyy", { locale: nl }),
                  ],
                  ["Tijd", resultaat.boeking.tijd],
                  ...(resultaat.boeking.adres ? [["Adres", resultaat.boeking.adres]] : []),
                ].map(([label, waarde]) => (
                  <div key={label} className="flex items-baseline justify-between gap-4 py-3">
                    <dt className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                      {label}
                    </dt>
                    <dd className="text-right text-sm font-semibold text-foreground first-letter:uppercase">
                      {waarde}
                    </dd>
                  </div>
                ))}
              </dl>

              {fout ? (
                <p className="mt-4 flex items-start gap-2 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  <TriangleAlert className="mt-0.5 size-4 shrink-0" />
                  {fout}
                </p>
              ) : null}

              <div className="mt-7 flex flex-col gap-2">
                <button
                  type="button"
                  disabled={annuleren.isPending}
                  onClick={() => {
                    setFout(null);
                    annuleren.mutate({ data: { bookingId, token } });
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background transition-opacity hover:opacity-85 disabled:opacity-50"
                >
                  {annuleren.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
                  Annuleer afspraak
                </button>
                <Link
                  to="/"
                  className="rounded-full px-6 py-3 text-center text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  Nee, laat maar staan
                </Link>
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

function Toestand({
  icoon,
  titel,
  tekst,
}: {
  icoon: React.ReactNode;
  titel: string;
  tekst: string;
}) {
  return (
    <div className="text-center">
      <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-foreground text-background">
        {icoon}
      </div>
      <h1 className="mt-6 font-display text-2xl font-bold tracking-tight text-foreground">
        {titel}
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{tekst}</p>
      <div className="mt-7 flex flex-col gap-2">
        <Link
          to="/boeken"
          className="rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background transition-opacity hover:opacity-85"
        >
          Nieuwe afspraak plannen
        </Link>
        <Link
          to="/"
          className="rounded-full px-6 py-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          Terug naar home
        </Link>
      </div>
    </div>
  );
}
