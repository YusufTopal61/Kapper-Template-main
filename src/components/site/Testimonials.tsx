import { motion } from "motion/react";
import { Star } from "lucide-react";

const reviews = [
  {
    quote:
      "Eerste keer binnengelopen, sindsdien nooit meer ergens anders geweest. Ze luisteren écht.",
    name: "Klantnaam",
    meta: "Vaste klant",
  },
  {
    quote:
      "Strakke fade, verzorgde baard en een gesprek dat nergens over hoeft te gaan. Precies goed.",
    name: "Klantnaam",
    meta: "Knippen + Baard",
  },
  {
    quote: "Rustige zaak, scherpe afwerking. Je merkt meteen dat hier mensen met vakkennis staan.",
    name: "Klantnaam",
    meta: "Knippen",
  },
];

export function Testimonials() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {reviews.map((review, i) => (
        <motion.blockquote
          key={i}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.55, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
          whileHover={{ y: -4 }}
          className="flex flex-col rounded-lg border border-border bg-card p-6 transition-colors duration-300 hover:border-foreground/25"
        >
          <div className="flex gap-0.5 text-foreground">
            {Array.from({ length: 5 }).map((_, s) => (
              <Star key={s} className="size-3.5 fill-current" />
            ))}
          </div>
          <p className="mt-5 flex-1 text-base leading-relaxed tracking-tight text-card-foreground">
            “{review.quote}”
          </p>
          <footer className="mt-6 border-t border-border pt-4">
            <p className="text-sm font-medium tracking-tight text-foreground">{review.name}</p>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">{review.meta}</p>
          </footer>
        </motion.blockquote>
      ))}
    </div>
  );
}
