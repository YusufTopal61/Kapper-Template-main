"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { Openingstijden } from "@/modules/settings/domain/settings.entity";
import type { ServiceUIModel } from "@/modules/services/presentation/service.uimodel";
import type { Tijdslot } from "../domain/booking.entity";
import { bepaalBoekbareDagen } from "../domain/booking.rules";
import { bookingKlantSchema, type BookingKlantInput } from "../domain/booking.schema";
import { createBookingAction, fetchAvailableSlots } from "./booking.actions";

export const WIZARD_STAPPEN = ["Dienst", "Datum & tijd", "Gegevens"] as const;
const LAATSTE_STAP = WIZARD_STAPPEN.length - 1;

type SlotenStaat = {
  sloten: Tijdslot[];
  gesloten: boolean;
  laden: boolean;
  fout: boolean;
};

/** Het laatst opgehaalde antwoord, met de keuze waarvoor het geldt. */
type GeladenSloten = { sleutel: string; sloten: Tijdslot[]; gesloten: boolean; fout: boolean };

/**
 * View model van de boekingswizard: welke stap, welke keuzes, beschikbaarheid
 * ophalen en versturen. Bedrijfsregels (welke dagen boekbaar zijn, of een tijd
 * past) staan in domain/ en op de server; hier zit alleen de schermstaat.
 */
export function useBookingWizard(props: {
  diensten: ServiceUIModel[];
  openingstijden: Openingstijden;
}) {
  const router = useRouter();
  const [stap, setStap] = useState(0);
  const [serviceId, setServiceId] = useState<string | null>(null);
  const [datum, setDatum] = useState<string | null>(null);
  const [tijd, setTijd] = useState<string | null>(null);
  const [formulierFout, setFormulierFout] = useState<string | null>(null);
  const [geladen, setGeladen] = useState<GeladenSloten | null>(null);
  /** Ophogen om de beschikbaarheid opnieuw op te halen (bijvoorbeeld nadat een slot net bezet raakte). */
  const [slotenVersie, setSlotenVersie] = useState(0);
  const [bezig, startTransition] = useTransition();

  const klantForm = useForm<BookingKlantInput>({
    resolver: zodResolver(bookingKlantSchema),
    defaultValues: { klant_naam: "", klant_email: "", klant_telefoon: "" },
    mode: "onTouched",
  });

  const boekbareDagen = useMemo(
    () => bepaalBoekbareDagen(props.openingstijden, new Date()),
    [props.openingstijden],
  );

  const gekozenDienst = props.diensten.find((dienst) => dienst.id === serviceId) ?? null;

  // Zolang het laatst opgehaalde antwoord niet bij de huidige keuze hoort, is het nog "laden".
  const sleutel = datum && serviceId ? `${datum}|${serviceId}|${slotenVersie}` : null;
  const slotenStaat: SlotenStaat =
    sleutel && geladen?.sleutel === sleutel
      ? { sloten: geladen.sloten, gesloten: geladen.gesloten, fout: geladen.fout, laden: false }
      : { sloten: [], gesloten: false, fout: false, laden: sleutel !== null };

  useEffect(() => {
    if (!datum || !serviceId) return;

    const dezeSleutel = `${datum}|${serviceId}|${slotenVersie}`;
    let actueel = true;

    fetchAvailableSlots({ datum, service_id: serviceId })
      .then((resultaat) => {
        if (!actueel) return;
        setGeladen({ sleutel: dezeSleutel, ...resultaat, fout: false });
        // Een eerder gekozen tijd kan door de nieuwe dag of dienst bezet zijn geraakt.
        setTijd((huidig) =>
          huidig && resultaat.sloten.some((slot) => slot.tijd === huidig && slot.beschikbaar)
            ? huidig
            : null,
        );
      })
      .catch(() => {
        if (actueel) setGeladen({ sleutel: dezeSleutel, sloten: [], gesloten: false, fout: true });
      });

    return () => {
      actueel = false;
    };
  }, [datum, serviceId, slotenVersie]);

  const magVerder =
    (stap === 0 && serviceId !== null) ||
    (stap === 1 && datum !== null && tijd !== null) ||
    stap === 2;

  const bevestig = klantForm.handleSubmit((klant) => {
    setFormulierFout(null);

    if (!serviceId || !datum || !tijd) {
      setFormulierFout("Kies eerst een dienst, een dag en een tijd.");
      return;
    }

    startTransition(async () => {
      try {
        const resultaat = await createBookingAction({
          service_id: serviceId,
          datum,
          tijd,
          ...klant,
        });

        if (!resultaat.ok) {
          setFormulierFout(resultaat.error);
          // Het tijdslot is in de tussentijd vergeven: terug naar de tijdkeuze met verse beschikbaarheid.
          if (resultaat.veld === "tijd" || resultaat.veld === "datum") {
            setTijd(null);
            setStap(1);
            setSlotenVersie((versie) => versie + 1);
          }
          return;
        }

        // Eigen bedankpagina i.p.v. inline wisselen: bruikbaar als conversiedoel
        // en werkt correct met de terug-knop. Geen e-mail of telefoon in de URL.
        const zoek = new URLSearchParams({
          dienst: resultaat.boeking.dienstNaam,
          datum: resultaat.boeking.datum,
          tijd: resultaat.boeking.tijd,
          mail: String(resultaat.emailVerzonden),
        });
        router.push(`/boeken/bevestigd?${zoek.toString()}`);
      } catch {
        setFormulierFout("Er ging iets mis bij het versturen. Probeer het zo nog eens.");
      }
    });
  });

  return {
    stap,
    stappen: WIZARD_STAPPEN,
    serviceId,
    datum,
    tijd,
    gekozenDienst,
    boekbareDagen,
    slotenStaat,
    klantForm,
    formulierFout,
    bezig,
    magVerder,
    kiesDienst: (id: string) => {
      setServiceId(id);
      setTijd(null);
    },
    kiesDatum: (waarde: string) => {
      setDatum(waarde);
      setTijd(null);
    },
    kiesTijd: setTijd,
    terug: () => setStap((huidig) => Math.max(0, huidig - 1)),
    volgende: () => {
      if (stap === LAATSTE_STAP) void bevestig();
      else setStap((huidig) => huidig + 1);
    },
    isLaatsteStap: stap === LAATSTE_STAP,
  };
}
