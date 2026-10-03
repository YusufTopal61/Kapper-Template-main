import type { Metadata } from "next";
import { getBookingDeps } from "@/lib/di/container";
import { cancelByTokenSchema } from "@/features/booking/domain/booking.schema";
import { getBookingByToken } from "@/features/booking/domain/usecases/get-booking-by-token";
import {
  CancelBookingView,
  type CancelLoadResult,
} from "@/features/booking/presentation/CancelBookingView";
import { limitRequests } from "@/lib/utils/request-limit.server";
import { buildMetadata } from "@/lib/seo/metadata";

export const dynamic = "force-dynamic";

// Cancel pages do not belong in search engines.
export const metadata: Metadata = buildMetadata({
  title: "Afspraak annuleren",
  description: "Annuleer je afspraak.",
  path: "/boeking/annuleren",
  noIndex: true,
});

const INVALID = { ok: false, error: "Deze annuleerlink is niet (meer) geldig." } as const;

async function load(bookingId: string, token: string): Promise<CancelLoadResult> {
  const input = cancelByTokenSchema.safeParse({ bookingId, token });
  if (!input.success) return INVALID;

  // Brake on guessing cancel tokens.
  if ((await limitRequests("cancel-read", 20)) !== null) {
    return { ok: false, error: "Te veel pogingen. Probeer het straks opnieuw." };
  }

  return getBookingByToken(getBookingDeps(), input.data);
}

export default async function CancelBookingPage({
  params,
  searchParams,
}: {
  params: Promise<{ bookingId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { bookingId } = await params;
  const query = await searchParams;
  const token = typeof query["token"] === "string" ? query["token"] : "";

  return (
    <main className="flex flex-1 items-center justify-center px-5 pt-28 pb-20 sm:pt-32">
      <CancelBookingView
        result={await load(bookingId, token)}
        bookingId={bookingId}
        token={token}
      />
    </main>
  );
}
