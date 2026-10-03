"use client";

import { format, isSameMonth, isToday } from "date-fns";
import { nl } from "date-fns/locale";
import { motion, AnimatePresence } from "motion/react";
import {
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Rows3,
  StickyNote,
  TriangleAlert,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { parseDate } from "@/features/settings/domain/opening-hours.rules";
import { BookingEditDialog } from "./BookingEditDialog";
import type { BookingUIModel } from "./booking.ui-model";
import { useBookingsCalendar } from "./use-bookings-calendar";

const WEEKDAYS_SHORT = ["MA", "DI", "WO", "DO", "VR", "ZA", "ZO"];

type BookingsCalendarProps = {
  bookings: BookingUIModel[];
  services: Array<{ id: string; name: string }>;
};

export function BookingsCalendar({ bookings, services }: BookingsCalendarProps) {
  const {
    view,
    setView,
    month,
    days,
    selectedDay,
    editing,
    error,
    isPending,
    activeCount,
    activeOnDay,
    dayBookings,
    selectDay,
    closeDay,
    previousMonth,
    nextMonth,
    edit,
    closeEditing,
    markCompleted,
    cancel,
    save,
  } = useBookingsCalendar(bookings);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Boekingen
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{activeCount} actieve afspraken</p>
        </div>

        <div className="flex items-center rounded-full border border-border bg-card p-1">
          <ToggleButton isActive={view === "calendar"} onClick={() => setView("calendar")}>
            <CalendarDays className="size-3.5" />
            Kalender
          </ToggleButton>
          <ToggleButton isActive={view === "list"} onClick={() => setView("list")}>
            <Rows3 className="size-3.5" />
            Lijst
          </ToggleButton>
        </div>
      </div>

      {error ? (
        <p
          role="alert"
          className="flex items-start gap-2 border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          <TriangleAlert className="mt-0.5 size-4 shrink-0" />
          {error}
        </p>
      ) : null}

      {view === "calendar" ? (
        <div className="rounded-2xl border border-border bg-card p-4 shadow-soft sm:p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold capitalize tracking-tight text-foreground">
              {format(month, "MMMM yyyy", { locale: nl })}
            </h2>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={previousMonth}
                className="inline-flex size-8 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-muted"
                aria-label="Vorige maand"
              >
                <ChevronLeft className="size-4" />
              </button>
              <button
                type="button"
                onClick={nextMonth}
                className="inline-flex size-8 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-muted"
                aria-label="Volgende maand"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-7 gap-1.5 sm:gap-2">
            {WEEKDAYS_SHORT.map((day) => (
              <div
                key={day}
                className="rounded-lg bg-muted py-1.5 text-center text-[10px] font-semibold tracking-widest text-muted-foreground"
              >
                {day}
              </div>
            ))}

            {days.map(({ date, iso }) => {
              const count = activeOnDay(iso).length;
              const inMonth = isSameMonth(date, month);
              const selected = selectedDay === iso;

              return (
                <button
                  key={iso}
                  type="button"
                  disabled={count === 0}
                  onClick={() => selectDay(iso)}
                  aria-label={`${format(date, "d MMMM", { locale: nl })}, ${count} afspraken`}
                  className={cn(
                    "relative flex aspect-square flex-col items-start justify-start rounded-xl border p-1.5 text-sm transition-colors sm:aspect-[4/3] sm:p-2",
                    inMonth ? "border-border" : "border-transparent opacity-30",
                    selected
                      ? "border-foreground bg-foreground text-background"
                      : count > 0
                        ? "bg-background hover:border-foreground/40"
                        : "bg-background",
                    count === 0 && "cursor-default",
                  )}
                >
                  <span className={cn(isToday(date) && !selected && "font-bold text-foreground")}>
                    {format(date, "d")}
                  </span>
                  {count > 0 ? (
                    <span
                      className={cn(
                        "absolute bottom-1 right-1 flex size-4 items-center justify-center rounded-full text-[9px] font-bold sm:size-[18px]",
                        selected
                          ? "bg-background text-foreground"
                          : "bg-foreground text-background",
                      )}
                    >
                      {count}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>

          <AnimatePresence mode="wait">
            {selectedDay ? (
              <motion.div
                key={selectedDay}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="mt-5 overflow-hidden border-t border-border pt-5"
              >
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    {format(parseDate(selectedDay), "EEEE d MMMM", { locale: nl })}
                  </p>
                  <button
                    type="button"
                    onClick={closeDay}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                    aria-label="Sluiten"
                  >
                    <X className="size-4" />
                  </button>
                </div>
                <div className="flex flex-col gap-2">
                  {dayBookings.map((booking) => (
                    <BookingListItem
                      key={booking.id}
                      booking={booking}
                      isPending={isPending}
                      onEdit={() => edit(booking)}
                      onComplete={() => markCompleted(booking.id)}
                      onCancel={() => cancel(booking.id)}
                    />
                  ))}
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Klant</TableHead>
                <TableHead>Dienst</TableHead>
                <TableHead>Datum</TableHead>
                <TableHead>Tijd</TableHead>
                <TableHead className="hidden lg:table-cell">Telefoon</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Acties</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-14 text-center text-muted-foreground">
                    Nog geen boekingen.
                  </TableCell>
                </TableRow>
              ) : (
                bookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell className="font-medium text-foreground">
                      <span className="flex items-center gap-1.5">
                        {booking.customerName}
                        {booking.notes ? (
                          <StickyNote
                            className="size-3.5 text-muted-foreground"
                            aria-label="Heeft interne notitie"
                          />
                        ) : null}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{booking.serviceName}</TableCell>
                    <TableCell className="text-muted-foreground">{booking.dateLabel}</TableCell>
                    <TableCell className="text-muted-foreground">{booking.time}</TableCell>
                    <TableCell className="hidden text-muted-foreground lg:table-cell">
                      {booking.customerPhone}
                    </TableCell>
                    <TableCell>
                      <Badge variant={booking.statusVariant} className="rounded-full">
                        {booking.statusLabel}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isPending}
                          onClick={() => edit(booking)}
                        >
                          Bewerken
                        </Button>
                        {booking.status === "confirmed" ? (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={isPending}
                              onClick={() => markCompleted(booking.id)}
                            >
                              Voltooid
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={isPending}
                              className="text-destructive hover:text-destructive"
                              onClick={() => cancel(booking.id)}
                            >
                              Annuleren
                            </Button>
                          </>
                        ) : null}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <BookingEditDialog
        booking={editing}
        services={services}
        isPending={isPending}
        onClose={closeEditing}
        onSave={save}
      />
    </div>
  );
}

function ToggleButton({
  isActive,
  onClick,
  children,
}: {
  isActive: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isActive}
      className={cn(
        "flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors",
        isActive ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

function BookingListItem({
  booking,
  isPending,
  onEdit,
  onComplete,
  onCancel,
}: {
  booking: BookingUIModel;
  isPending: boolean;
  onEdit: () => void;
  onComplete: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border px-4 py-3">
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">{booking.customerName}</span>
          <Badge variant={booking.statusVariant} className="rounded-full">
            {booking.statusLabel}
          </Badge>
        </div>
        <span className="text-xs text-muted-foreground">
          {booking.serviceName} · {booking.time} · {booking.customerPhone}
        </span>
        {booking.notes ? (
          <span className="mt-1 flex items-start gap-1.5 text-xs italic text-muted-foreground">
            <StickyNote className="mt-0.5 size-3 shrink-0" />
            {booking.notes}
          </span>
        ) : null}
      </div>
      <div className="flex gap-1.5">
        <Button variant="outline" size="sm" disabled={isPending} onClick={onEdit}>
          Bewerken
        </Button>
        {booking.status === "confirmed" ? (
          <>
            <Button variant="outline" size="sm" disabled={isPending} onClick={onComplete}>
              <Check className="size-3.5" />
              Voltooid
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={isPending}
              className="text-destructive hover:text-destructive"
              onClick={onCancel}
            >
              Annuleren
            </Button>
          </>
        ) : null}
      </div>
    </div>
  );
}
