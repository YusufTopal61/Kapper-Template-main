import { Link } from "@tanstack/react-router";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { ArrowRight, Search } from "lucide-react";
import { Badge } from "./Badge";

const paletteRows = [
  { label: "Knippen", meta: "30 min · € 00" },
  { label: "Knippen + Baard", meta: "45 min · € 00" },
  { label: "Baard", meta: "20 min · € 00" },
];

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const fade = useTransform(scrollYProgress, [0, 0.85], [1, 0]);

  return (
    <section ref={ref} className="relative overflow-hidden border-b border-border pt-28 sm:pt-36">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[600px] block-grid" />

      <div className="relative mx-auto max-w-6xl px-5 pb-20 sm:px-8 sm:pb-28">
        <motion.div style={{ opacity: fade }} className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <Badge label="Nieuw" text="Online afspraken nu beschikbaar" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
            className="mt-7 font-display text-6xl font-medium leading-[0.92] tracking-tighter text-foreground sm:text-7xl lg:text-8xl"
          >
            Scherp geknipt.
            <span className="block text-muted-foreground">Rustig afgewerkt.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.14, ease: [0.22, 1, 0.36, 1] }}
            className="mt-7 max-w-lg text-lg leading-relaxed tracking-tight text-muted-foreground"
          >
            Een kapsel dat klopt, elke keer opnieuw. Vakmanschap, precisie en de tijd
            die je knipbeurt verdient.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="mt-9 flex flex-col gap-3 sm:flex-row"
          >
            <Link
              to="/boeken"
              className="group inline-flex items-center justify-center gap-2 rounded-md bg-foreground px-6 py-3 text-sm font-medium tracking-tight text-background transition-opacity hover:opacity-85"
            >
              Plan afspraak
              <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
            <Link
              to="/diensten"
              className="inline-flex items-center justify-center rounded-md border border-border px-6 py-3 text-sm font-medium tracking-tight text-foreground transition-colors hover:bg-muted"
            >
              Bekijk diensten
            </Link>
          </motion.div>
        </motion.div>

        {/* Mock command-palette window as the hero's visual anchor. */}
        <motion.div
          style={{ y }}
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="relative mt-16 overflow-hidden rounded-lg border border-border bg-background shadow-lift sm:mt-20"
        >
          <div className="flex items-center gap-2 border-b border-border px-4 py-3">
            <span className="size-2.5 rounded-full bg-muted-foreground/25" />
            <span className="size-2.5 rounded-full bg-muted-foreground/25" />
            <span className="size-2.5 rounded-full bg-muted-foreground/25" />
            <span className="ml-3 truncate text-xs tracking-tight text-muted-foreground">
              barber — afspraak plannen
            </span>
          </div>

          <div className="flex items-center gap-3 border-b border-border px-4 py-4 sm:px-6">
            <Search className="size-4 text-muted-foreground" />
            <span className="text-sm tracking-tight text-muted-foreground">
              Zoek een behandeling…
            </span>
            <span className="ml-auto rounded border border-border px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
              ⌘K
            </span>
          </div>

          <div className="divide-y divide-border">
            {paletteRows.map((row, i) => (
              <div
                key={row.label}
                className={`flex items-center justify-between px-4 py-3.5 text-sm tracking-tight transition-colors hover:bg-muted sm:px-6 ${
                  i === 0 ? "bg-muted/60" : ""
                }`}
              >
                <span className="font-medium text-foreground">{row.label}</span>
                <span className="text-muted-foreground">{row.meta}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between px-4 py-3 text-[11px] tracking-tight text-muted-foreground sm:px-6">
            <span>Di – Za · 09:00 – 18:00</span>
            <span>Bevestiging direct per mail</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
