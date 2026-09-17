import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Check } from "lucide-react";
import { services } from "@/lib/site-data";

export function ServiceCards({ detailed = false }: { detailed?: boolean }) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {services.map((service, i) => (
        <motion.article
          key={service.name}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.55, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
          whileHover={{ y: -4 }}
          className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-colors duration-300 hover:border-foreground/25"
        >
          <div
            className={`h-24 ${i === 1 ? "block-ink" : "block-fog"} transition-transform duration-500 group-hover:scale-[1.03]`}
          />
          <div className="flex flex-1 flex-col p-6">
            <div className="flex items-baseline justify-between gap-4">
              <h3 className="font-display text-xl font-medium tracking-tighter text-card-foreground">
                {service.name}
              </h3>
              <span className="font-display text-lg font-medium tracking-tighter text-foreground">
                {service.price}
              </span>
            </div>
            <p className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">
              {service.duration}
            </p>
            <p className="mt-4 text-sm leading-relaxed tracking-tight text-muted-foreground">
              {service.description}
            </p>

            {detailed ? (
              <ul className="mt-5 space-y-2 border-t border-border pt-5">
                {service.includes.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2 text-sm tracking-tight text-muted-foreground"
                  >
                    <Check className="size-3.5 text-foreground" />
                    {item}
                  </li>
                ))}
              </ul>
            ) : null}

            <Link
              to="/boeken"
              className="mt-6 inline-flex w-fit rounded-md border border-border px-4 py-2 text-sm font-medium tracking-tight text-foreground transition-colors hover:bg-foreground hover:text-background"
            >
              Reserveren
            </Link>
          </div>
        </motion.article>
      ))}
    </div>
  );
}
