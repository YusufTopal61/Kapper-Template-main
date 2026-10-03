import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/modules/site/presentation/Navbar";
import { PageHeader } from "@/modules/site/presentation/PageHeader";
import { Gallery } from "@/modules/site/presentation/Gallery";
import { CtaBanner } from "@/modules/site/presentation/CtaBanner";
import { Footer } from "@/modules/site/presentation/Footer";

const title = "Galerij — BARBER";
const description = "Een indruk van het werk, de sfeer en de zaak.";

export const Route = createFileRoute("/galerij")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: GalerijPage,
});

function GalerijPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <PageHeader
          badgeLabel="Galerij"
          badgeText="Een blik binnen"
          title="Werk, sfeer en finish."
          description="Van scherpe fades tot verzorgde baardlijnen — dit is de standaard die we elke dag aanhouden."
        />
        <section className="py-24 sm:py-32">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <Gallery />
          </div>
        </section>
        <CtaBanner />
      </main>
      <Footer />
    </div>
  );
}
