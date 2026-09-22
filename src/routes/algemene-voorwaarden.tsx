import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { PageHeader } from "@/components/site/PageHeader";
import { Footer } from "@/components/site/Footer";

const title = "Algemene voorwaarden — BARBER";
const description = "De afspraken rond het maken, wijzigen en annuleren van een boeking.";

export const Route = createFileRoute("/algemene-voorwaarden")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: VoorwaardenPage,
});

function VoorwaardenPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <PageHeader
          badgeLabel="Voorwaarden"
          badgeText="Laatst bijgewerkt: september 2026"
          title="Algemene voorwaarden."
          description="De afspraken rond het maken, wijzigen en annuleren van een boeking."
        />

        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-3xl px-5 sm:px-8">
            <div className="mb-10 rounded-2xl border border-dashed border-border bg-muted/40 p-5 text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">Let op — voorbeeldtekst.</span> Dit
              zijn standaardvoorwaarden voor een kleine dienstverlener. Pas de annuleertermijn,
              prijzen en aansprakelijkheidsbepalingen aan naar jouw situatie en laat de tekst
              controleren door een jurist voordat je live gaat.
            </div>

            <div className="prose-kapper">
              <h2>Toepasselijkheid</h2>
              <p>
                Deze voorwaarden gelden voor iedere afspraak die je via deze website maakt bij
                [Bedrijfsnaam].
              </p>

              <h2>Een afspraak maken</h2>
              <p>
                Een afspraak is definitief zodra je de bevestigingsmail ontvangt. Controleer bij het
                boeken of je naam, e-mailadres en telefoonnummer correct zijn ingevuld — op deze
                gegevens ontvang je alle communicatie over je afspraak.
              </p>

              <h2>Annuleren of wijzigen</h2>
              <p>
                Je kunt je afspraak kosteloos annuleren via de link in je bevestigingsmail. Doe dit
                het liefst zo vroeg mogelijk, zodat het tijdslot weer beschikbaar komt voor een
                andere klant. Wil je een afspraak verzetten in plaats van annuleren, neem dan
                telefonisch of per e-mail contact op.
              </p>

              <h2>Niet verschijnen</h2>
              <p>
                Ben je niet aanwezig op je afspraak zonder te annuleren, dan kunnen we dit
                registreren als &ldquo;no-show&rdquo;. Bij herhaaldelijk niet verschijnen kunnen we
                besluiten toekomstige boekingen te weigeren.
              </p>

              <h2>Prijzen</h2>
              <p>
                De vermelde prijzen zijn onder voorbehoud van wijzigingen. De prijs die gold op het
                moment van boeken is de prijs die voor jouw afspraak geldt.
              </p>

              <h2>Aansprakelijkheid</h2>
              <p>
                We besteden onze diensten met zorg uit, maar zijn niet aansprakelijk voor schade die
                voortvloeit uit onjuist ingevulde contactgegevens of het niet tijdig doorgeven van
                wijzigingen.
              </p>

              <h2>Contact</h2>
              <p>
                Vragen over deze voorwaarden? Neem contact met ons op via de gegevens op onze
                contactpagina.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
