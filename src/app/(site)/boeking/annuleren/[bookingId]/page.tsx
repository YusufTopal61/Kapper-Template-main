import type { Metadata } from "next";
import { getBookingDeps } from "@/app/di/container";
import { cancelByTokenSchema } from "@/modules/booking/domain/booking.schema";
import { getBookingByToken } from "@/modules/booking/domain/usecases/getBookingByToken";
import {
  CancelBookingView,
  type AnnuleerLaadResultaat,
} from "@/modules/booking/presentation/CancelBookingView";
import { beperkAanvragen } from "@/shared/lib/request-limit.server";
import { maakMetadata } from "@/shared/seo/metadata";

export const dynamic = "force-dynamic";

// Annuleerpagina's horen niet in zoekmachines.
export const metadata: Metadata = maakMetadata({
  titel: "Afspraak annuleren",
  beschrijving: "Annuleer je afspraak.",
  pad: "/boeking/annuleren",
  nietIndexeren: true,
});

const ONGELDIG = { ok: false, error: "Deze annuleerlink is niet (meer) geldig." } as const;

async function laad(bookingId: string, token: string): Promise<AnnuleerLaadResultaat> {
  const invoer = cancelByTokenSchema.safeParse({ bookingId, token });
  if (!invoer.success) return ONGELDIG;

  // Rem op het raden van annuleertokens.
  if ((await beperkAanvragen("annuleer-lees", 20)) !== null) {
    return { ok: false, error: "Te veel pogingen. Probeer het straks opnieuw." };
  }

  return getBookingByToken(getBookingDeps(), invoer.data);
}

export default async function AnnulerenPage({
  params,
  searchParams,
}: {
  params: Promise<{ bookingId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { bookingId } = await params;
  const zoek = await searchParams;
  const token = typeof zoek["token"] === "string" ? zoek["token"] : "";

  return (
    <main className="flex flex-1 items-center justify-center px-5 pt-28 pb-20 sm:pt-32">
      <CancelBookingView
        resultaat={await laad(bookingId, token)}
        bookingId={bookingId}
        token={token}
      />
    </main>
  );
}
