"use client";

import { useState, useTransition } from "react";
import { cancelBookingByTokenAction } from "./booking.actions";

/** View model van de annuleerpagina: bevestigen, wachten, uitkomst tonen. */
export function useCancelBooking(bookingId: string, token: string) {
  const [cancelled, setCancelled] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function cancel() {
    setError(null);
    startTransition(async () => {
      try {
        const outcome = await cancelBookingByTokenAction({ bookingId, token });
        if (outcome.ok) setCancelled(true);
        else setError(outcome.error);
      } catch {
        setError("Er ging iets mis. Probeer het zo nog eens.");
      }
    });
  }

  return { cancelled, error, isPending, cancel };
}
