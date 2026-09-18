import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { Booking } from "@/components/site/Booking";
import { Footer } from "@/components/site/Footer";

const title = "Boeken — BARBER";
const description = "Kies je behandeling, pak een tijdslot en klaar. Bevestiging volgt direct.";

export const Route = createFileRoute("/boeken")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: BoekenPage,
});

function BoekenPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 sm:pt-28">
        <Booking />
      </main>
      <Footer />
    </div>
  );
}
