import { motion } from "motion/react";
import { Link } from "@tanstack/react-router";
import { SectionHeading } from "./SectionHeading";
import type { Service } from "@/lib/supabase/types";

/** Afwisselende vlakken, zodat de kaarten ook zonder foto's ritme houden. */
const BLOKKEN = ["block-fog", "block-accent", "block-fog", "block-mid"];

const euro = (prijs: number) =>
  new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR" }).format(prijs);

export function Services({ diensten }: { diensten: Service[] }) {
  return (
    <section id="diensten" className="bg-background py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="Diensten"
          title="Vakwerk, tot in de details."
          description="Geen eindeloze menukaart. Alleen wat we tot in de puntjes beheersen."
        />

        {diensten.length === 0 ? (
          <p className="mt-14 rounded-lg border border-dashed border-border px-6 py-14 text-center text-sm text-muted-foreground">
            Er zijn op dit moment geen diensten beschikbaar.
          </p>
        ) : (
          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {diensten.map((dienst, i) => (
              <motion.article
                key={dienst.id}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -8 }}
                className="group flex flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-soft transition-shadow duration-300 hover:shadow-lift"
              >
                <div
                  className={`h-32 ${BLOKKEN[i % BLOKKEN.length]} transition-transform duration-500 group-hover:scale-[1.04]`}
                />
                <div className="flex flex-1 flex-col p-7">
                  <div className="flex items-baseline justify-between gap-4">
                    <h3 className="font-display text-xl font-bold tracking-tight text-card-foreground">
                      {dienst.naam}
                    </h3>
                    <span className="font-display text-lg font-bold text-accent">
                      {euro(dienst.prijs)}
                    </span>
                  </div>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    {dienst.duur_minuten} min
                  </p>
                  <p className="mt-4 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {dienst.beschrijving}
                  </p>
                  <Link
                    to="/boeken"
                    className="mt-6 inline-flex w-fit text-sm font-semibold text-foreground underline-offset-4 transition-colors hover:text-accent hover:underline"
                  >
                    Reserveer {dienst.naam.toLowerCase()}
                  </Link>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
