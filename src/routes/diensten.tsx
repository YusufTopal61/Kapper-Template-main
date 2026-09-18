import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { PageHeader } from "@/components/site/PageHeader";
import { Services } from "@/components/site/Services";
import { CtaBanner } from "@/components/site/CtaBanner";
import { Footer } from "@/components/site/Footer";

const title = "Diensten — BARBER";
const description =
  "Knippen, baard en de volledige behandeling. Bekijk prijs, duur en wat elke dienst inhoudt.";

export const Route = createFileRoute("/diensten")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: DienstenPage,
});

function DienstenPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <PageHeader
          badgeLabel="Diensten"
          badgeText="Drie behandelingen, één standaard"
          title="Wat we doen."
          description="Geen eindeloze menukaart. Alleen wat we tot in de puntjes beheersen — knippen, baard en de combinatie van de twee."
        />
        <Services />
        <CtaBanner />
      </main>
      <Footer />
    </div>
  );
}
