import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Pagina niet gevonden",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-28">
      <span className="text-eyebrow text-muted-foreground">Fout 404</span>
      <h1 className="mt-4 font-display text-7xl font-bold tracking-tighter text-foreground sm:text-8xl">
        404
      </h1>
      <p className="mt-4 max-w-sm text-center text-base text-muted-foreground">
        Deze pagina bestaat niet (meer), of het adres klopt niet.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background transition-opacity hover:opacity-85"
        >
          <ArrowLeft className="size-4" />
          Terug naar home
        </Link>
        <Link
          href="/boeken"
          className="inline-flex items-center justify-center rounded-full border border-border px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
        >
          Plan een afspraak
        </Link>
      </div>
    </div>
  );
}
