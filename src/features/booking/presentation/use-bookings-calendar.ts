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
import { formatDate } from "@/features/settings/domain/opening-hours.rules";
import type { AdminBookingUpdate } from "../domain/booking.schema";
import { cancelBookingAdminAction, updateBookingAction } from "./booking.actions";
import type { BookingUIModel } from "./booking.ui-model";

type Outcome = { ok: true } | { ok: false; error: string };

/**
 * View model of the bookings screen: calendar or list, which month and day,
 * which booking is being edited, and the admin actions. The bookings themselves
 * come as props from the server; after every change we ask the server for a
 * fresh version (router.refresh) instead of keeping our own copy.
 */
export function useBookingsCalendar(bookings: BookingUIModel[]) {
  const router = useRouter();
  const [view, setView] = useState<"calendar" | "list">("calendar");
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [editing, setEditing] = useState<BookingUIModel | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const days = useMemo(
    () =>
      eachDayOfInterval({
        start: startOfWeek(startOfMonth(month), { weekStartsOn: 1 }),
        end: endOfWeek(endOfMonth(month), { weekStartsOn: 1 }),
      }).map((day) => ({ date: day, iso: formatDate(day) })),
    [month],
  );

  const perDay = useMemo(() => {
    const groups = new Map<string, BookingUIModel[]>();
    for (const booking of bookings) {
      groups.set(booking.date, [...(groups.get(booking.date) ?? []), booking]);
    }
    for (const list of groups.values()) list.sort((a, b) => a.time.localeCompare(b.time));
    return groups;
  }, [bookings]);

  const activeOnDay = (iso: string) =>
    (perDay.get(iso) ?? []).filter((booking) => booking.status !== "cancelled");

  function run(action: () => Promise<Outcome>, onSuccess?: () => void) {
    setError(null);
    startTransition(async () => {
      try {
        const outcome = await action();
        if (!outcome.ok) {
          setError(outcome.error);
          return;
        }
        onSuccess?.();
        router.refresh();
      } catch {
        setError("Dit kon niet worden opgeslagen. Probeer het zo nog eens.");
      }
    });
  }

  return {
    view,
    setView,
    month,
    days,
    selectedDay,
    editing,
    error,
    isPending,
    activeCount: bookings.filter((booking) => booking.status !== "cancelled").length,
    activeOnDay,
    dayBookings: selectedDay ? (perDay.get(selectedDay) ?? []) : [],
    selectDay: (iso: string) => setSelectedDay((previous) => (previous === iso ? null : iso)),
    closeDay: () => setSelectedDay(null),
    previousMonth: () => {
      setMonth((current) => subMonths(current, 1));
      setSelectedDay(null);
    },
    nextMonth: () => {
      setMonth((current) => addMonths(current, 1));
      setSelectedDay(null);
    },
    edit: setEditing,
    closeEditing: () => setEditing(null),
    markCompleted: (id: string) => run(() => updateBookingAction({ id, status: "completed" })),
    cancel: (id: string) => {
      if (!window.confirm("Deze afspraak annuleren? De klant krijgt hiervan bericht per e-mail.")) {
        return;
      }
      run(() => cancelBookingAdminAction({ id }));
    },
    save: (change: AdminBookingUpdate) =>
      run(
        () => updateBookingAction(change),
        () => setEditing(null),
      ),
  };
}
