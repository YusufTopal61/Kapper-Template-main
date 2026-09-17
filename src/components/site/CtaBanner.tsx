import { Link } from "@tanstack/react-router";
import { Reveal } from "./Reveal";

export function CtaBanner() {
  return (
    <section className="border-t border-border py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal>
          <div className="flex flex-col items-start justify-between gap-8 rounded-lg border border-border bg-muted/40 p-8 sm:p-12 lg:flex-row lg:items-center">
            <div>
              <h2 className="font-display text-4xl font-medium leading-[0.98] tracking-tighter text-foreground sm:text-5xl">
                Klaar voor je volgende knipbeurt?
              </h2>
              <p className="mt-4 max-w-md text-base tracking-tight text-muted-foreground">
                Kies je behandeling en tijdslot. Binnen een minuut geregeld.
              </p>
            </div>
            <Link
              to="/boeken"
              className="inline-flex shrink-0 items-center justify-center rounded-md bg-foreground px-6 py-3 text-sm font-medium tracking-tight text-background transition-opacity hover:opacity-85"
            >
              Plan afspraak
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
