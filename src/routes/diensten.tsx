import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/modules/site/presentation/Navbar";
import { PageHeader } from "@/modules/site/presentation/PageHeader";
import { ServicesSection } from "@/modules/services/presentation/ServicesSection";
import { CtaBanner } from "@/modules/site/presentation/CtaBanner";
import { Footer } from "@/modules/site/presentation/Footer";
import { fetchActiveServices } from "@/modules/services/business/services.actions";

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
  loader: async () => ({ diensten: await fetchActiveServices() }),
  component: DienstenPage,
});

function DienstenPage() {
  const { diensten } = Route.useLoaderData();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <PageHeader
          badgeLabel="Diensten"
          badgeText="Vakwerk, tot in de details"
          title="Wat we doen."
          description="Geen eindeloze menukaart. Alleen wat we tot in de puntjes beheersen — knippen, baard en de combinatie van de twee."
        />
        <ServicesSection diensten={diensten} />
        <CtaBanner />
      </main>
      <Footer />
    </div>
  );
}
