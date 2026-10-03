import type { Metadata } from "next";
import { BookingConfirmedView } from "@/features/booking/presentation/BookingConfirmedView";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Afspraak bevestigd",
  description: "Je afspraak staat genoteerd.",
  path: "/boeken/bevestigd",
  noIndex: true,
});

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

/** Eén tekstwaarde uit de URL, ingekort zodat een absurd lange link de pagina niet opblaast. */
function text(value: string | string[] | undefined): string {
  return (typeof value === "string" ? value : "").slice(0, 120);
}

export default async function BookingConfirmedPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  // Alleen niet-gevoelige velden voor op het scherm; e-mail, telefoon en token staan bewust niet in de URL.
  const query = await searchParams;

  return (
    <main className="flex flex-1 items-center justify-center px-5 pt-28 pb-20 sm:pt-32">
      <BookingConfirmedView
        service={text(query["service"])}
        date={text(query["date"])}
        time={text(query["time"])}
        mail={text(query["mail"]) === "true"}
      />
    </main>
  );
}
