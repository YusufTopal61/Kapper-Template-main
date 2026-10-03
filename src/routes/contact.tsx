import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/modules/site/presentation/Navbar";
import { ContactSection } from "@/modules/settings/presentation/ContactSection";
import { Footer } from "@/modules/site/presentation/Footer";
import { fetchPublicSettings } from "@/modules/settings/business/settings.actions";

const title = "Contact — BARBER";
const description = "Adres, openingstijden en contactgegevens. Loop gerust binnen.";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  loader: async () => ({ instellingen: await fetchPublicSettings() }),
  component: ContactPage,
});

function ContactPage() {
  const { instellingen } = Route.useLoaderData();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 sm:pt-28">
        <ContactSection instellingen={instellingen} />
      </main>
      <Footer />
    </div>
  );
}
