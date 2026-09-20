import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { Hero } from "@/components/site/Hero";
import { Services } from "@/components/site/Services";
import { About } from "@/components/site/About";
import { Gallery } from "@/components/site/Gallery";
import { Booking } from "@/components/site/Booking";
import { Testimonials } from "@/components/site/Testimonials";
import { Contact } from "@/components/site/Contact";
import { Footer } from "@/components/site/Footer";
import { fetchActiveServices } from "@/api/services";
import { fetchPublicSettings } from "@/api/settings";

const title = "BARBER — Premium barbershop";
const description =
  "Scherp geknipt, rustig afgewerkt. Knippen, baard en de volledige behandeling. Plan eenvoudig online je afspraak.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  // Server-side geladen, zodat diensten en openingstijden meteen in de HTML staan.
  loader: async () => ({
    diensten: await fetchActiveServices(),
    instellingen: await fetchPublicSettings(),
  }),
  component: Index,
});

function Index() {
  const { diensten, instellingen } = Route.useLoaderData();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero />
        <Services diensten={diensten} />
        <section className="py-24 sm:py-32">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <About />
          </div>
        </section>
        <section className="pb-24 sm:pb-32">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <Gallery limit={6} />
          </div>
        </section>
        <Booking />
        <section className="py-24 sm:py-32">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <Testimonials />
          </div>
        </section>
        <Contact instellingen={instellingen} />
      </main>
      <Footer />
    </div>
  );
}
