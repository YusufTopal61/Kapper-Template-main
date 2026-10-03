"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { OpeningHours } from "@/features/settings/domain/settings.entity";
import type { ServiceUIModel } from "@/features/services/presentation/service.ui-model";
import type { TimeSlot } from "../domain/booking.entity";
import { getBookableDays } from "../domain/booking.rules";
import { bookingCustomerSchema, type BookingCustomerInput } from "../domain/booking.schema";
import { createBookingAction, fetchAvailableSlots } from "./booking.actions";

export const WIZARD_STEPS = ["Dienst", "Datum & tijd", "Gegevens"] as const;
const LAST_STEP = WIZARD_STEPS.length - 1;

type SlotsState = {
  slots: TimeSlot[];
  closed: boolean;
  loading: boolean;
  error: boolean;
};

/** Het laatst opgehaalde antwoord, met de keuze waarvoor het geldt. */
type LoadedSlots = { key: string; slots: TimeSlot[]; closed: boolean; error: boolean };

/**
 * View model van de boekingswizard: welke stap, welke keuzes, beschikbaarheid
 * ophalen en versturen. Bedrijfsregels (welke dagen boekbaar zijn, of een tijd
 * past) staan in domain/ en op de server; hier zit alleen de schermstaat.
 */
export function useBookingWizard(props: {
  services: ServiceUIModel[];
  openingHours: OpeningHours;
}) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [serviceId, setServiceId] = useState<string | null>(null);
  const [date, setDate] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState<LoadedSlots | null>(null);
  /** Ophogen om de beschikbaarheid opnieuw op te halen (bijvoorbeeld nadat een slot net bezet raakte). */
  const [slotsVersion, setSlotsVersion] = useState(0);
  const [isPending, startTransition] = useTransition();

  const customerForm = useForm<BookingCustomerInput>({
    resolver: zodResolver(bookingCustomerSchema),
    defaultValues: { customerName: "", customerEmail: "", customerPhone: "" },
    mode: "onTouched",
  });

  const bookableDays = useMemo(
    () => getBookableDays(props.openingHours, new Date()),
    [props.openingHours],
  );

  const selectedService = props.services.find((service) => service.id === serviceId) ?? null;

  // Zolang het laatst opgehaalde antwoord niet bij de huidige keuze hoort, is het nog "laden".
  const key = date && serviceId ? `${date}|${serviceId}|${slotsVersion}` : null;
  const slotsState: SlotsState =
    key && loaded?.key === key
      ? { slots: loaded.slots, closed: loaded.closed, error: loaded.error, loading: false }
      : { slots: [], closed: false, error: false, loading: key !== null };

  useEffect(() => {
    if (!date || !serviceId) return;

    const thisKey = `${date}|${serviceId}|${slotsVersion}`;
    let isCurrent = true;

    fetchAvailableSlots({ date, serviceId: serviceId })
      .then((result) => {
        if (!isCurrent) return;
        setLoaded({ key: thisKey, ...result, error: false });
        // Een eerder gekozen tijd kan door de nieuwe dag of dienst bezet zijn geraakt.
        setTime((current) =>
          current && result.slots.some((slot) => slot.time === current && slot.available)
            ? current
            : null,
        );
      })
      .catch(() => {
        if (isCurrent) setLoaded({ key: thisKey, slots: [], closed: false, error: true });
      });

    return () => {
      isCurrent = false;
    };
  }, [date, serviceId, slotsVersion]);

  const canProceed =
    (step === 0 && serviceId !== null) ||
    (step === 1 && date !== null && time !== null) ||
    step === 2;

  const confirmBooking = customerForm.handleSubmit((customer) => {
    setFormError(null);

    if (!serviceId || !date || !time) {
      setFormError("Kies eerst een dienst, een dag en een tijd.");
      return;
    }

    startTransition(async () => {
      try {
        const result = await createBookingAction({
          serviceId: serviceId,
          date,
          time,
          ...customer,
        });

        if (!result.ok) {
          setFormError(result.error);
          // Het tijdslot is in de tussentijd vergeven: terug naar de tijdkeuze met verse beschikbaarheid.
          if (result.field === "time" || result.field === "date") {
            setTime(null);
            setStep(1);
            setSlotsVersion((version) => version + 1);
          }
          return;
        }

        // Eigen bedankpagina i.p.v. inline wisselen: bruikbaar als conversiedoel
        // en werkt correct met de terug-knop. Geen e-mail of telefoon in de URL.
        const query = new URLSearchParams({
          service: result.booking.serviceName,
          date: result.booking.date,
          time: result.booking.time,
          mail: String(result.emailSent),
        });
        router.push(`/boeken/bevestigd?${query.toString()}`);
      } catch {
        setFormError("Er ging iets mis bij het versturen. Probeer het zo nog eens.");
      }
    });
  });

  return {
    step,
    steps: WIZARD_STEPS,
    serviceId,
    date,
    time,
    selectedService,
    bookableDays,
    slotsState,
    customerForm,
    formError,
    isPending,
    canProceed,
    selectService: (id: string) => {
      setServiceId(id);
      setTime(null);
    },
    selectDate: (value: string) => {
      setDate(value);
      setTime(null);
    },
    selectTime: setTime,
    back: () => setStep((current) => Math.max(0, current - 1)),
    next: () => {
      if (step === LAST_STEP) void confirmBooking();
      else setStep((current) => current + 1);
    },
    isLastStep: step === LAST_STEP,
  };
}
