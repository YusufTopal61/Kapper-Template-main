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

/** The most recently fetched answer, with the choice it applies to. */
type LoadedSlots = { key: string; slots: TimeSlot[]; closed: boolean; error: boolean };

/**
 * View model of the booking wizard: which step, which choices, fetching
 * availability and submitting. Business rules (which days are bookable, whether a
 * time fits) live in domain/ and on the server; only screen state lives here.
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
  /** Increment to refetch availability (for example after a slot was just taken). */
  const [slotsVersion, setSlotsVersion] = useState(0);
  const [isPending, startTransition] = useTransition();

  const customerForm = useForm<BookingCustomerInput>({
    resolver: zodResolver(bookingCustomerSchema),
    defaultValues: { customerName: "", customerEmail: "", customerPhone: "", website: "" },
    mode: "onTouched",
  });

  const bookableDays = useMemo(
    () => getBookableDays(props.openingHours, new Date()),
    [props.openingHours],
  );

  const selectedService = props.services.find((service) => service.id === serviceId) ?? null;

  // As long as the most recently fetched answer does not belong to the current choice, it is still "loading".
  const key = date && serviceId ? `${date}|${serviceId}|${slotsVersion}` : null;
  const slotsState: SlotsState =
    key && loaded?.key === key
      ? { slots: loaded.slots, closed: loaded.closed, error: loaded.error, loading: false }
      : { slots: [], closed: false, error: false, loading: key !== null };

  useEffect(() => {
    if (!date || !serviceId) return;

    const thisKey = `${date}|${serviceId}|${slotsVersion}`;
    let isCurrent = true;

    fetchAvailableSlots({ date, serviceId })
      .then((result) => {
        if (!isCurrent) return;
        if (!result.ok) {
          setLoaded({ key: thisKey, slots: [], closed: false, error: true });
          return;
        }
        setLoaded({ key: thisKey, slots: result.slots, closed: result.closed, error: false });
        // A previously chosen time may have been taken by the new day or service.
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
          serviceId,
          date,
          time,
          ...customer,
        });

        if (!result.ok) {
          setFormError(result.error);
          // The time slot was taken in the meantime: back to the time choice with fresh availability.
          if (result.field === "time" || result.field === "date") {
            setTime(null);
            setStep(1);
            setSlotsVersion((version) => version + 1);
          }
          return;
        }

        // Dedicated thank-you page instead of switching inline: usable as a conversion goal
        // and works correctly with the back button. No email or phone in the URL.
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
