import { Reveal } from "./Reveal";

const hours = [
  { day: "Maandag", time: "Gesloten" },
  { day: "Dinsdag – Vrijdag", time: "09:00 – 18:00" },
  { day: "Zaterdag", time: "09:00 – 17:00" },
  { day: "Zondag", time: "Gesloten" },
];

export function Contact() {
  return (
    <section id="contact" className="bg-background py-24 sm:py-32">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 sm:px-8 lg:grid-cols-2 lg:items-center">
        <Reveal>
          <div className="relative aspect-4/3 overflow-hidden rounded-3xl block-fog border border-border shadow-soft">
            <div className="absolute inset-0 block-grid opacity-70" />
            <div className="absolute left-1/2 top-1/2 size-16 -translate-x-1/2 -translate-y-1/2 rounded-full block-accent shadow-accent" />
            <div className="absolute left-1/2 top-1/2 size-32 -translate-x-1/2 -translate-y-1/2 rounded-full border border-accent/30" />
            <span className="absolute bottom-5 left-6 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Kaart — plaatshouder
            </span>
          </div>
        </Reveal>

        <div>
          <Reveal>
            <span className="text-eyebrow text-accent">Bezoek ons</span>
            <h2 className="mt-4 font-display text-4xl leading-[1.05] tracking-tight text-foreground sm:text-5xl">
              Loop binnen.
            </h2>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="mt-8 grid gap-8 sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Adres
                </p>
                <p className="mt-3 text-base leading-relaxed text-foreground">
                  Straatnaam 00
                  <br />
                  0000 AA Plaatsnaam
                  <br />
                  Nederland
                </p>
                <p className="mt-5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Contact
                </p>
                <p className="mt-3 text-base text-foreground">
                  06 00 00 00 00
                  <br />
                  hallo@voorbeeld.nl
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Openingstijden
                </p>
                <ul className="mt-3 space-y-2.5">
                  {hours.map((h) => (
                    <li
                      key={h.day}
                      className="flex items-baseline justify-between gap-4 border-b border-border pb-2.5 text-sm"
                    >
                      <span className="text-foreground">{h.day}</span>
                      <span className="text-muted-foreground">{h.time}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-6 flex gap-2">
                  {["IG", "FB", "TT"].map((s) => (
                    <a
                      key={s}
                      href="#contact"
                      className="inline-flex size-10 items-center justify-center rounded-full border border-border text-xs font-bold text-foreground transition-colors hover:border-accent hover:text-accent"
                    >
                      {s}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
