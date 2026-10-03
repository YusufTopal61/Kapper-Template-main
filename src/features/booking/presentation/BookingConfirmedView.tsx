import Link from "next/link";
import { Check } from "lucide-react";
import { formatDatumLang } from "./booking.uimodel";

/** De bedankkaart na een geslaagde boeking. Krijgt alleen niet-gevoelige velden mee. */
export function BookingConfirmedView({
  dienst,
  datum,
  tijd,
  mail,
}: {
  dienst: string;
  datum: string;
  tijd: string;
  /** Is de bevestigingsmail daadwerkelijk verzonden? */
  mail: boolean;
}) {
  const heeftGegevens = Boolean(dienst && datum && tijd);

  return (
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
            ["Datum", formatDatumLang(datum)],
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
            De bevestiging is onderweg naar het e-mailadres dat je hebt ingevuld. Daarin staat ook
            een link om te annuleren.
          </>
        ) : (
          "Je afspraak staat vast. De bevestigingsmail kon nog niet verstuurd worden — noteer het moment even voor de zekerheid."
        )}
      </p>

      <div className="mt-8 flex flex-col gap-2">
        <Link
          href="/"
          className="rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background transition-opacity hover:opacity-85"
        >
          Terug naar home
        </Link>
      </div>
    </div>
  );
}
