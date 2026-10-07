import { Reveal } from "@/components/ui/reveal";
import { siteConfig } from "@/config/site";

const pillars = [
  { title: "Vakmanschap", body: "Klassieke techniek, hedendaagse uitvoering." },
  { title: "Rust", body: "Geen haast, alle tijd en aandacht voor jouw knipbeurt." },
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
            Een goed kapsel begint met luisteren. We nemen eerst de tijd om te horen wat je wilt,
            adviseren eerlijk en beginnen dan pas met knippen.
          </p>
          {extended ? (
            <>
              <p className="mt-4 max-w-xl text-base leading-relaxed tracking-tight text-muted-foreground sm:text-lg">
                Geen haast, geen ruis. We kijken hoe je haar valt en hoe je het thuis draagt, zodat
                het ook na een paar weken nog goed zit.
              </p>
              <p className="mt-4 max-w-xl text-base leading-relaxed tracking-tight text-muted-foreground sm:text-lg">
                Je komt binnen, je gaat zitten en je loopt scherp weer naar buiten. Simpel, precies
                zoals het hoort.
              </p>
            </>
          ) : (
            <p className="mt-4 max-w-xl text-base leading-relaxed tracking-tight text-muted-foreground sm:text-lg">
              Geen haast, geen ruis. Alleen een resultaat waar je tevreden mee naar buiten loopt.
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
              {siteConfig.brandName}
            </p>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
