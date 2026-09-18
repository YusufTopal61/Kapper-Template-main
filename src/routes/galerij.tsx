import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { PageHeader } from "@/components/site/PageHeader";
import { Gallery } from "@/components/site/Gallery";
import { CtaBanner } from "@/components/site/CtaBanner";
import { Footer } from "@/components/site/Footer";

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
