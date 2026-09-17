import { motion } from "motion/react";
import { SectionHeading } from "./SectionHeading";

const services = [
  {
    name: "Knippen",
    price: "€ 00",
    duration: "30 min",
    description:
      "Een strak, persoonlijk kapsel. Advies vooraf, precisie tijdens, styling na afloop.",
    block: "block-fog",
  },
  {
    name: "Knippen + Baard",
    price: "€ 00",
    duration: "45 min",
    description:
      "De volledige behandeling. Kapsel en baardlijn perfect op elkaar afgestemd.",
    block: "block-accent",
    featured: true,
  },
  {
    name: "Baard",
    price: "€ 00",
    duration: "20 min",
    description:
      "Trimmen, modelleren en scheren met warme doek. Scherpe lijnen, verzorgde finish.",
    block: "block-fog",
  },
];

export function Services() {
  return (
    <section id="diensten" className="bg-background py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="Diensten"
          title="Drie behandelingen, één standaard."
          description="Geen eindeloze menukaart. Alleen wat we tot in de puntjes beheersen."
        />

        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {services.map((service, i) => (
            <motion.article
              key={service.name}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -8 }}
              className="group flex flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-soft transition-shadow duration-300 hover:shadow-lift"
            >
              <div className={`h-32 ${service.block} transition-transform duration-500 group-hover:scale-[1.04]`} />
              <div className="flex flex-1 flex-col p-7">
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="font-display text-xl font-bold tracking-tight text-card-foreground">
                    {service.name}
                  </h3>
                  <span className="font-display text-lg font-bold text-accent">
                    {service.price}
                  </span>
                </div>
                <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  {service.duration}
                </p>
                <p className="mt-4 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {service.description}
                </p>
                <a
                  href="#boeken"
                  className="mt-6 inline-flex w-fit text-sm font-semibold text-foreground underline-offset-4 transition-colors hover:text-accent hover:underline"
                >
                  Reserveer {service.name.toLowerCase()}
                </a>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
