import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { PageHeader } from "@/components/site/PageHeader";
import { Footer } from "@/components/site/Footer";

const title = "Privacybeleid — BARBER";
const description = "Hoe we omgaan met de gegevens die je bij ons achterlaat.";

export const Route = createFileRoute("/privacybeleid")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: PrivacybeleidPage,
});

function PrivacybeleidPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <PageHeader
          badgeLabel="Privacy"
          badgeText="Laatst bijgewerkt: september 2026"
          title="Privacybeleid."
          description="Hoe we omgaan met de gegevens die je bij ons achterlaat."
        />

        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-3xl px-5 sm:px-8">
            <div className="mb-10 rounded-2xl border border-dashed border-border bg-muted/40 p-5 text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">Let op — voorbeeldtekst.</span> Dit is
              een standaard privacybeleid voor een kleine, lokale onderneming. Het is geen juridisch
              advies en dekt niet elke situatie. Laat deze tekst controleren door een jurist of
              gebruik een generator zoals die van de Autoriteit Persoonsgegevens voordat je live
              gaat.
            </div>

            <div className="prose-kapper">
              <h2>Wie we zijn</h2>
              <p>
                Dit privacybeleid is van toepassing op de website en het boekingssysteem van
                [Bedrijfsnaam] (hierna: &ldquo;wij&rdquo;). Vul hier je KVK-nummer en
                vestigingsadres in.
              </p>

              <h2>Welke gegevens we verzamelen</h2>
              <p>Wanneer je een afspraak boekt, verwerken we:</p>
              <ul>
                <li>Je naam</li>
                <li>Je e-mailadres</li>
                <li>Je telefoonnummer</li>
                <li>De gekozen dienst, datum en tijd</li>
              </ul>
              <p>
                Deze gegevens zijn nodig om je afspraak vast te leggen, te bevestigen en — als je
                dat wilt — te annuleren. Zonder deze gegevens kunnen we geen afspraak voor je
                inplannen.
              </p>

              <h2>Waarom we deze gegevens gebruiken</h2>
              <ul>
                <li>Om je boeking te verwerken en te bevestigen per e-mail</li>
                <li>Om contact op te nemen bij vragen over je afspraak</li>
                <li>Om je te informeren als een afspraak wijzigt of wordt geannuleerd</li>
              </ul>
              <p>
                We gebruiken je gegevens niet voor marketingdoeleinden, tenzij je daar apart
                toestemming voor geeft.
              </p>

              <h2>Hoe lang we gegevens bewaren</h2>
              <p>
                Boekingsgegevens bewaren we zolang als nodig is voor de bedrijfsvoering en om te
                voldoen aan wettelijke (fiscale) bewaarplichten. Daarna worden ze verwijderd.
              </p>

              <h2>Wie je gegevens kan zien</h2>
              <p>We werken met de volgende verwerkers om deze site te laten draaien:</p>
              <ul>
                <li>
                  <strong>Supabase</strong> — voor het opslaan van boekingen en het inloggen van
                  beheerders.
                </li>
                <li>
                  <strong>Resend</strong> — voor het versturen van bevestigings- en
                  annuleringsmails.
                </li>
              </ul>
              <p>
                Met beide partijen zijn verwerkersovereenkomsten af te sluiten. We delen je gegevens
                niet met anderen, tenzij we daartoe wettelijk verplicht zijn.
              </p>

              <h2>Cookies</h2>
              <p>
                Deze site gebruikt alleen noodzakelijke cookies om te functioneren (bijvoorbeeld om
                een ingelogde beheerder herkend te houden). Met jouw toestemming gebruiken we
                daarnaast een privacyvriendelijke, cookievrije statistiekdienst om te zien welke
                pagina&apos;s bezocht worden — zonder dat we jou daarbij individueel volgen.
              </p>

              <h2>Jouw rechten</h2>
              <p>Je hebt het recht om:</p>
              <ul>
                <li>Inzage te vragen in de gegevens die we van je hebben</li>
                <li>Onjuiste gegevens te laten corrigeren</li>
                <li>Je gegevens te laten verwijderen</li>
                <li>Bezwaar te maken tegen de verwerking van je gegevens</li>
              </ul>
              <p>Neem hiervoor contact met ons op via de gegevens op onze contactpagina.</p>

              <h2>Vragen of klachten</h2>
              <p>
                Heb je een vraag over dit privacybeleid, of een klacht over hoe we met je gegevens
                omgaan? Neem dan contact met ons op. Kom je er met ons niet uit, dan kun je een
                klacht indienen bij de Autoriteit Persoonsgegevens.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
