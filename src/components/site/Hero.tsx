import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { Badge } from "./Badge";
import { WordsPullUp } from "./WordsPullUp";

export function Hero() {
  return (
    <section className="px-3 pt-3 sm:px-4 sm:pt-4">
      <div className="relative min-h-[88vh] w-full overflow-hidden rounded-2xl bg-ink sm:min-h-[92vh] sm:rounded-[2rem]">
        {/* Abstract monochrome backdrop — grid + soft glow, no photography. */}
        <div
          className="pointer-events-none absolute inset-0 block-grid opacity-[0.15]"
          style={{ maskImage: "radial-gradient(ellipse at 30% 20%, black, transparent 70%)" }}
        />
        <div className="pointer-events-none absolute -left-[10%] -top-[10%] size-[55vw] rounded-full bg-white/[0.07] blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-0 size-[40vw] rounded-full bg-white/[0.04] blur-3xl" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60" />

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="absolute left-5 top-24 sm:left-8 sm:top-28"
        >
          <Badge label="Nieuw" text="Online afspraken nu beschikbaar" />
        </motion.div>

        <div className="absolute inset-x-0 bottom-0 px-5 pb-8 sm:px-8 sm:pb-12 md:px-10">
          <div className="grid grid-cols-12 items-end gap-6">
            <div className="col-span-12 lg:col-span-8">
              <h1 className="font-display font-medium leading-[0.86] tracking-[-0.045em] text-ink-foreground text-[15vw] sm:text-[10vw] lg:text-[7vw]">
                <WordsPullUp text="Scherp geknipt." />
              </h1>
            </div>

            <div className="col-span-12 flex flex-col gap-5 pb-1 lg:col-span-4 lg:pb-3">
              <motion.p
                initial={{ y: 16, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
                className="max-w-sm text-sm leading-relaxed tracking-tight text-ink-muted sm:text-base"
              >
                Een kapsel dat klopt, elke keer opnieuw. Vakmanschap, precisie en de tijd die je
                knipbeurt verdient.
              </motion.p>

              <motion.div
                initial={{ y: 16, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
              >
                <Link
                  to="/boeken"
                  className="group inline-flex items-center gap-2 self-start rounded-full bg-ink-foreground py-1.5 pl-6 pr-1.5 text-sm font-medium tracking-tight text-ink transition-all hover:gap-3"
                >
                  Plan afspraak
                  <span className="flex size-10 items-center justify-center rounded-full bg-ink text-ink-foreground transition-transform group-hover:scale-110">
                    <ArrowRight className="size-4" />
                  </span>
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
