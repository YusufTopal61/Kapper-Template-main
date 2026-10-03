import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/modules/site/presentation/Navbar";
import { Hero } from "@/modules/site/presentation/Hero";
import { ServicesSection } from "@/modules/services/presentation/ServicesSection";
import { About } from "@/modules/site/presentation/About";
import { Gallery } from "@/modules/site/presentation/Gallery";
import { BookingWizard } from "@/modules/booking/presentation/BookingWizard";
import { Testimonials } from "@/modules/site/presentation/Testimonials";
import { ContactSection } from "@/modules/settings/presentation/ContactSection";
import { Footer } from "@/modules/site/presentation/Footer";
import { fetchActiveServices } from "@/modules/services/business/services.actions";
import { fetchPublicSettings } from "@/modules/settings/business/settings.actions";

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
        <ServicesSection diensten={diensten} />
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
        <BookingWizard />
        <section className="py-24 sm:py-32">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <Testimonials />
          </div>
        </section>
        <ContactSection instellingen={instellingen} />
      </main>
      <Footer />
    </div>
  );
}
