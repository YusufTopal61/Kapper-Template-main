import { Reveal } from "./Reveal";

const pillars = [
  { title: "Vakmanschap", body: "Klassieke techniek, hedendaagse uitvoering." },
  { title: "Rust", body: "Eén klant per stoel, alle tijd en aandacht." },
  { title: "Consistentie", body: "Dezelfde scherpe finish, elk bezoek opnieuw." },
];

export function About({ extended = false }: { extended?: boolean }) {
  return (
    <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
      <div>
        <Reveal>
          <h2 className="font-display text-4xl font-medium leading-[0.98] tracking-tighter text-foreground sm:text-5xl">
            Een stoel, een spiegel en aandacht voor detail.
          </h2>
        </Reveal>
        <Reveal delay={0.08}>
          <p className="mt-6 max-w-xl text-base leading-relaxed tracking-tight text-muted-foreground sm:text-lg">
            Wat begon als een kleine zaak met twee stoelen, groeide uit tot een plek waar mannen
            terugkomen voor meer dan een knipbeurt. Wij geloven in eerlijk vakmanschap: luisteren,
            adviseren en dan pas de schaar.
          </p>
          {extended ? (
            <>
              <p className="mt-4 max-w-xl text-base leading-relaxed tracking-tight text-muted-foreground sm:text-lg">
                Geen haast, geen ruis. Onze barbiers nemen de tijd om te begrijpen hoe je haar valt,
                hoe je het thuis draagt en wat er over drie weken nog steeds goed moet zitten.
              </p>
              <p className="mt-4 max-w-xl text-base leading-relaxed tracking-tight text-muted-foreground sm:text-lg">
                Het resultaat is een vaste routine: je komt binnen, je gaat zitten, en je loopt
                scherp weer naar buiten. Simpel, precies zoals het hoort.
              </p>
            </>
          ) : (
            <p className="mt-4 max-w-xl text-base leading-relaxed tracking-tight text-muted-foreground sm:text-lg">
              Geen haast, geen ruis. Alleen een resultaat dat er over drie weken nog steeds goed
              uitziet.
            </p>
          )}
        </Reveal>

        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {pillars.map((pillar, i) => (
            <Reveal key={pillar.title} delay={0.12 + i * 0.06}>
              <div className="border-l border-border pl-4">
                <p className="text-sm font-semibold tracking-tight text-foreground">
                  {pillar.title}
                </p>
                <p className="mt-2 text-sm leading-relaxed tracking-tight text-muted-foreground">
                  {pillar.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      <Reveal delay={0.1}>
        <div className="relative aspect-4/5 overflow-hidden rounded-lg border border-border block-fog">
          <div className="absolute left-1/2 top-1/2 size-52 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-lg block-ink sm:size-72" />
          <div className="absolute inset-6 rounded-lg border border-foreground/10" />
          <div className="absolute bottom-8 left-8 right-8">
            <p className="font-display text-xl font-medium leading-snug tracking-tighter text-foreground">
              “Een goed kapsel is stil. Het valt pas op als het ontbreekt.”
            </p>
            <p className="mt-3 text-xs uppercase tracking-[0.2em] text-muted-foreground">
              [Brand name] — sinds 20XX
            </p>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
