"use client";

import { useEffect } from "react";
import { RotateCw } from "lucide-react";
import { logger } from "@/lib/logger";

/**
 * Safety net for unexpected errors in a page. The visitor gets a friendly
 * message; the details go to the console (and later to Sentry), never to the
 * screen. `error.digest` is the reference to the server log.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.error("ui", "unhandled error in a page", error, { digest: error.digest });
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
        {/* Plain link: after an error we want a clean page, not client-side navigation. */}
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
