"use client";

import { useState, useTransition } from "react";
import { cancelBookingByTokenAction } from "./booking.actions";

/** View model van de annuleerpagina: bevestigen, wachten, uitkomst tonen. */
export function useCancelBooking(bookingId: string, token: string) {
  const [geannuleerd, setGeannuleerd] = useState(false);
  const [fout, setFout] = useState<string | null>(null);
  const [bezig, startTransition] = useTransition();

  function annuleer() {
    setFout(null);
    startTransition(async () => {
      try {
        const uitkomst = await cancelBookingByTokenAction({ bookingId, token });
        if (uitkomst.ok) setGeannuleerd(true);
        else setFout(uitkomst.error);
      } catch {
        setFout("Er ging iets mis. Probeer het zo nog eens.");
      }
    });
  }

  return { geannuleerd, fout, bezig, annuleer };
}
