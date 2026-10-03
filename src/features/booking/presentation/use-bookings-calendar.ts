"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { formatDatum } from "@/modules/settings/domain/opening-hours.rules";
import type { AdminBookingUpdate } from "../domain/booking.schema";
import { cancelBookingAdminAction, updateBookingAction } from "./booking.actions";
import type { BookingUIModel } from "./booking.uimodel";

type Uitkomst = { ok: true } | { ok: false; error: string };

/**
 * View model van het boekingenscherm: kalender of lijst, welke maand en dag,
 * welke boeking wordt bewerkt, en de beheeracties. De boekingen zelf komen als
 * props van de server; na elke wijziging vragen we de server om een verse
 * versie (router.refresh) in plaats van een eigen kopie bij te houden.
 */
export function useBookingsCalendar(boekingen: BookingUIModel[]) {
  const router = useRouter();
  const [weergave, setWeergave] = useState<"kalender" | "lijst">("kalender");
  const [maand, setMaand] = useState(() => startOfMonth(new Date()));
  const [gekozenDag, setGekozenDag] = useState<string | null>(null);
  const [bewerkt, setBewerkt] = useState<BookingUIModel | null>(null);
  const [fout, setFout] = useState<string | null>(null);
  const [bezig, startTransition] = useTransition();

  const dagen = useMemo(
    () =>
      eachDayOfInterval({
        start: startOfWeek(startOfMonth(maand), { weekStartsOn: 1 }),
        end: endOfWeek(endOfMonth(maand), { weekStartsOn: 1 }),
      }).map((dag) => ({ datum: dag, iso: formatDatum(dag) })),
    [maand],
  );

  const perDag = useMemo(() => {
    const groepen = new Map<string, BookingUIModel[]>();
    for (const boeking of boekingen) {
      groepen.set(boeking.datum, [...(groepen.get(boeking.datum) ?? []), boeking]);
    }
    for (const lijst of groepen.values()) lijst.sort((a, b) => a.tijd.localeCompare(b.tijd));
    return groepen;
  }, [boekingen]);

  const actieveOpDag = (iso: string) =>
    (perDag.get(iso) ?? []).filter((boeking) => boeking.status !== "geannuleerd");

  function voerUit(actie: () => Promise<Uitkomst>, naSucces?: () => void) {
    setFout(null);
    startTransition(async () => {
      try {
        const uitkomst = await actie();
        if (!uitkomst.ok) {
          setFout(uitkomst.error);
          return;
        }
        naSucces?.();
        router.refresh();
      } catch {
        setFout("Dit kon niet worden opgeslagen. Probeer het zo nog eens.");
      }
    });
  }

  return {
    weergave,
    setWeergave,
    maand,
    dagen,
    gekozenDag,
    bewerkt,
    fout,
    bezig,
    aantalActief: boekingen.filter((boeking) => boeking.status !== "geannuleerd").length,
    actieveOpDag,
    dagBoekingen: gekozenDag ? (perDag.get(gekozenDag) ?? []) : [],
    kiesDag: (iso: string) => setGekozenDag((vorige) => (vorige === iso ? null : iso)),
    sluitDag: () => setGekozenDag(null),
    vorigeMaand: () => {
      setMaand((huidig) => subMonths(huidig, 1));
      setGekozenDag(null);
    },
    volgendeMaand: () => {
      setMaand((huidig) => addMonths(huidig, 1));
      setGekozenDag(null);
    },
    bewerk: setBewerkt,
    sluitBewerken: () => setBewerkt(null),
    markeerVoltooid: (id: string) => voerUit(() => updateBookingAction({ id, status: "voltooid" })),
    annuleer: (id: string) => {
      if (!window.confirm("Deze afspraak annuleren? De klant krijgt hiervan bericht per e-mail.")) {
        return;
      }
      voerUit(() => cancelBookingAdminAction({ id }));
    },
    opslaan: (wijziging: AdminBookingUpdate) =>
      voerUit(
        () => updateBookingAction(wijziging),
        () => setBewerkt(null),
      ),
  };
}
