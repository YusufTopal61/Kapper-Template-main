import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/modules/site/presentation/Navbar";
import { Footer } from "@/modules/site/presentation/Footer";
import { BookingConfirmedView } from "@/modules/booking/presentation/BookingConfirmedView";

export const Route = createFileRoute("/boeken/bevestigd")({
  head: () => ({
    meta: [
      { title: "Afspraak bevestigd — BARBER" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  // Niet-gevoelige samenvatting voor op het scherm; e-mail/telefoon/token
  // staan bewust niet in de URL.
  validateSearch: (search: Record<string, unknown>) => ({
    dienst: typeof search["dienst"] === "string" ? search["dienst"] : "",
    datum: typeof search["datum"] === "string" ? search["datum"] : "",
    tijd: typeof search["tijd"] === "string" ? search["tijd"] : "",
    email: typeof search["email"] === "string" ? search["email"] : "",
    mail: search["mail"] === true || search["mail"] === "true",
  }),
  component: BevestigdPage,
});

function BevestigdPage() {
  const { dienst, datum, tijd, email, mail } = Route.useSearch();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex flex-1 items-center justify-center px-5 pt-28 pb-20 sm:pt-32">
        <BookingConfirmedView dienst={dienst} datum={datum} tijd={tijd} email={email} mail={mail} />
      </main>
      <Footer />
    </div>
  );
}
