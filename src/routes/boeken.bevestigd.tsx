import { createFileRoute, Link } from "@tanstack/react-router";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { Check } from "lucide-react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { parseDatum } from "@/lib/opening-hours";

export const Route = createFileRoute("/boeken/bevestigd")({
  head: () => ({
    meta: [
      { title: "Afspraak bevestigd — BARBER" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  // Niet-gevoelige samenvatting voor op het scherm; e-mail/telefoon/token
  // staan bewust niet in de URL.
  validateSearch: (search: Record<string, unknown>) => ({
    dienst: typeof search["dienst"] === "string" ? search["dienst"] : "",
    datum: typeof search["datum"] === "string" ? search["datum"] : "",
    tijd: typeof search["tijd"] === "string" ? search["tijd"] : "",
    email: typeof search["email"] === "string" ? search["email"] : "",
    mail: search["mail"] === true || search["mail"] === "true",
  }),
  component: BevestigdPage,
});

function BevestigdPage() {
  const { dienst, datum, tijd, email, mail } = Route.useSearch();
  const heeftGegevens = Boolean(dienst && datum && tijd);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex flex-1 items-center justify-center px-5 pt-28 pb-20 sm:pt-32">
        <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 text-center shadow-lift">
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-foreground text-background">
            <Check className="size-6" />
          </div>
          <h1 className="mt-6 font-display text-2xl font-bold tracking-tight text-foreground">
            Je afspraak staat genoteerd
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Tot dan — we zorgen dat de stoel klaarstaat.
          </p>

          {heeftGegevens ? (
            <dl className="mx-auto mt-7 divide-y divide-border border-y border-border text-left">
              {[
                ["Dienst", dienst],
                ["Datum", format(parseDatum(datum), "EEEE d MMMM yyyy", { locale: nl })],
                ["Tijd", tijd],
              ].map(([label, waarde]) => (
                <div key={label} className="flex items-baseline justify-between gap-4 py-3">
                  <dt className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    {label}
                  </dt>
                  <dd className="text-sm font-semibold text-foreground first-letter:uppercase">
                    {waarde}
                  </dd>
                </div>
              ))}
            </dl>
          ) : null}

          <p className="mt-6 text-sm text-muted-foreground">
            {mail ? (
              <>
                De bevestiging is onderweg{email ? " naar " : ""}
                {email ? <span className="font-semibold text-foreground">{email}</span> : null}.
                Daarin staat ook een link om te annuleren.
              </>
            ) : (
              "Je afspraak staat vast. De bevestigingsmail kon nog niet verstuurd worden — noteer het moment even voor de zekerheid."
            )}
          </p>

          <div className="mt-8 flex flex-col gap-2">
            <Link
              to="/"
              className="rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background transition-opacity hover:opacity-85"
            >
              Terug naar home
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
