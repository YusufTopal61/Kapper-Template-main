import type { Metadata } from "next";
import { BookingConfirmedView } from "@/modules/booking/presentation/BookingConfirmedView";
import { maakMetadata } from "@/shared/seo/metadata";

export const metadata: Metadata = maakMetadata({
  titel: "Afspraak bevestigd",
  beschrijving: "Je afspraak staat genoteerd.",
  pad: "/boeken/bevestigd",
  nietIndexeren: true,
});

type ZoekParams = Promise<Record<string, string | string[] | undefined>>;

/** Eén tekstwaarde uit de URL, ingekort zodat een absurd lange link de pagina niet opblaast. */
function tekst(waarde: string | string[] | undefined): string {
  return (typeof waarde === "string" ? waarde : "").slice(0, 120);
}

export default async function BevestigdPage({ searchParams }: { searchParams: ZoekParams }) {
  // Alleen niet-gevoelige velden voor op het scherm; e-mail, telefoon en token staan bewust niet in de URL.
  const zoek = await searchParams;

  return (
    <main className="flex flex-1 items-center justify-center px-5 pt-28 pb-20 sm:pt-32">
      <BookingConfirmedView
        dienst={tekst(zoek["dienst"])}
        datum={tekst(zoek["datum"])}
        tijd={tekst(zoek["tijd"])}
        mail={tekst(zoek["mail"]) === "true"}
      />
    </main>
  );
}
