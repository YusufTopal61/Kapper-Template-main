"use client";

import { useEffect } from "react";
import { RotateCw } from "lucide-react";

/**
 * Vangnet voor onverwachte fouten in een pagina. De bezoeker krijgt een nette
 * melding; de details gaan naar de console (en later naar Sentry), nooit naar
 * het scherm. `error.digest` is de verwijzing naar de serverlog.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-28">
      <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
        Deze pagina laadde niet
      </h1>
      <p className="mt-2 max-w-sm text-center text-sm text-muted-foreground">
        Er ging iets mis aan onze kant. Probeer het opnieuw, of ga terug naar home.
      </p>
      {error.digest ? (
        <p className="mt-2 text-xs text-muted-foreground">Referentie: {error.digest}</p>
      ) : null}
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background transition-opacity hover:opacity-85"
        >
          <RotateCw className="size-4" />
          Probeer opnieuw
        </button>
        {/* Gewone link: na een fout willen we een schone pagina, geen client-navigatie. */}
        <a
          href="/"
          className="inline-flex items-center justify-center rounded-full border border-border px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
        >
          Terug naar home
        </a>
      </div>
    </div>
  );
}
