import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/modules/site/presentation/Navbar";
import { Footer } from "@/modules/site/presentation/Footer";
import { fetchBookingByToken } from "@/modules/booking/business/booking.actions";
import {
  CancelBookingView,
  type AnnuleerLaadResultaat,
} from "@/modules/booking/presentation/CancelBookingView";

const UUID_PATROON = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const Route = createFileRoute("/boeking/annuleren/$bookingId")({
  head: () => ({
    meta: [
      { title: "Afspraak annuleren" },
      // Annuleerpagina's horen niet in zoekmachines.
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  validateSearch: (search: Record<string, unknown>) => ({
    token: typeof search["token"] === "string" ? search["token"] : "",
  }),
  loaderDeps: ({ search }) => ({ token: search.token }),
  loader: async ({ params, deps }): Promise<AnnuleerLaadResultaat> => {
    if (!deps.token || deps.token.length < 16 || !UUID_PATROON.test(params.bookingId)) {
      return { ok: false, error: "Deze annuleerlink is niet (meer) geldig." };
    }
    return fetchBookingByToken({
      data: { bookingId: params.bookingId, token: deps.token },
    });
  },
  component: AnnuleerPagina,
});

function AnnuleerPagina() {
  const resultaat = Route.useLoaderData();
  const { bookingId } = Route.useParams();
  const { token } = Route.useSearch();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex flex-1 items-center justify-center px-5 pt-28 pb-20 sm:pt-32">
        <CancelBookingView resultaat={resultaat} bookingId={bookingId} token={token} />
      </main>
      <Footer />
    </div>
  );
}
