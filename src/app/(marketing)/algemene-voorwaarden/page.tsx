import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { siteConfig } from "@/config/site";
import { getSiteUrl } from "@/lib/env.server";
import { JsonLd } from "@/lib/seo/JsonLd";
import { buildMetadata } from "@/lib/seo/metadata";
import { breadcrumbJsonLd } from "@/lib/seo/structured-data";

const TITLE = "Algemene voorwaarden";
const DESCRIPTION = "De afspraken rond het maken, wijzigen en annuleren van een boeking.";

export const metadata: Metadata = buildMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: "/algemene-voorwaarden",
});

export default function TermsPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd(getSiteUrl(), [
          { name: siteConfig.brandName, path: "/" },
          { name: TITLE, path: "/algemene-voorwaarden" },
        ])}
      />
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
    </>
  );
}
