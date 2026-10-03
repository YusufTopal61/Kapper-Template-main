"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { SectionHeading } from "@/components/ui/section-heading";
import type { ServiceUIModel } from "./service.ui-model";

/** Afwisselende vlakken, zodat de kaarten ook zonder foto's ritme houden. */
const BLOCKS = ["block-fog", "block-accent", "block-fog", "block-mid"];

export function ServicesSection({ services }: { services: ServiceUIModel[] }) {
  return (
    <section id="services" className="bg-background py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="Diensten"
          title="Vakwerk, tot in de details."
          description="Geen eindeloze menukaart. Alleen wat we tot in de puntjes beheersen."
        />

        {services.length === 0 ? (
          <p className="mt-14 rounded-lg border border-dashed border-border px-6 py-14 text-center text-sm text-muted-foreground">
            Er zijn op dit moment geen diensten beschikbaar.
          </p>
        ) : (
          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {services.map((service, i) => (
              <motion.article
                key={service.id}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -8 }}
                className="group flex flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-soft transition-shadow duration-300 hover:shadow-lift"
              >
                <div
                  className={`h-32 ${BLOCKS[i % BLOCKS.length]} transition-transform duration-500 group-hover:scale-[1.04]`}
                />
                <div className="flex flex-1 flex-col p-7">
                  <div className="flex items-baseline justify-between gap-4">
                    <h3 className="font-display text-xl font-bold tracking-tight text-card-foreground">
                      {service.name}
                    </h3>
                    <span className="font-display text-lg font-bold text-accent">
                      {service.priceLabel}
                    </span>
                  </div>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    {service.durationLabel}
                  </p>
                  <p className="mt-4 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {service.description}
                  </p>
                  <Link
                    href="/boeken"
                    className="mt-6 inline-flex w-fit text-sm font-semibold text-foreground underline-offset-4 transition-colors hover:text-accent hover:underline"
                  >
                    Reserveer {service.name.toLowerCase()}
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
