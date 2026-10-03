import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/modules/site/presentation/Navbar";
import { PageHeader } from "@/modules/site/presentation/PageHeader";
import { About } from "@/modules/site/presentation/About";
import { CtaBanner } from "@/modules/site/presentation/CtaBanner";
import { Footer } from "@/modules/site/presentation/Footer";

const title = "Over ons — BARBER";
const description =
  "Wat begon als een kleine zaak met twee stoelen, groeide uit tot een plek waar mannen terugkomen voor meer dan een knipbeurt.";

export const Route = createFileRoute("/over-ons")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: OverOnsPage,
});

function OverOnsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <PageHeader
          badgeLabel="Over ons"
          badgeText="Vakmanschap sinds jaar en dag"
          title="Een stoel, een spiegel, aandacht."
          description="Eerlijk vakmanschap: luisteren, adviseren en dan pas de schaar."
        />
        <section className="py-24 sm:py-32">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <About extended />
          </div>
        </section>
        <CtaBanner />
      </main>
      <Footer />
    </div>
  );
}
