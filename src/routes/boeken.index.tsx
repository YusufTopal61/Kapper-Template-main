import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/modules/site/presentation/Navbar";
import { BookingWizard } from "@/modules/booking/presentation/BookingWizard";
import { Footer } from "@/modules/site/presentation/Footer";

const title = "Boeken — BARBER";
const description = "Kies je behandeling, pak een tijdslot en klaar. Bevestiging volgt direct.";

export const Route = createFileRoute("/boeken/")({
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
        <BookingWizard />
      </main>
      <Footer />
    </div>
  );
}
