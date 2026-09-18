import { useMemo, useState } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  parseISO,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { nl } from "date-fns/locale";
import { motion, AnimatePresence } from "motion/react";
import { CalendarDays, ChevronLeft, ChevronRight, Rows3, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { initialBookings, type Booking, type BookingStatus } from "@/lib/admin-data";
import { services } from "@/lib/site-data";

const weekdayLabels = ["MA", "DI", "WO", "DO", "VR", "ZA", "ZO"];

const statusVariant: Record<BookingStatus, "default" | "secondary" | "destructive"> = {
  bevestigd: "default",
  voltooid: "secondary",
  geannuleerd: "destructive",
};

function formatDatum(datum: string) {
  return format(parseISO(datum), "d MMM yyyy", { locale: nl });
}

export function BookingsCalendar() {
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [view, setView] = useState<"kalender" | "lijst">("kalender");
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [editing, setEditing] = useState<Booking | null>(null);

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(month), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(month), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [month]);

  const bookingsByDay = (day: Date) =>
    bookings
      .filter((b) => isSameDay(parseISO(b.datum), day))
      .sort((a, b) => a.tijd.localeCompare(b.tijd));

  const sortedBookings = useMemo(
    () => [...bookings].sort((a, b) => (a.datum + a.tijd).localeCompare(b.datum + b.tijd)),
    [bookings],
  );

  function updateBooking(updated: Booking) {
    setBookings((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
  }

  function cancelBooking(id: string) {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: "geannuleerd" as const } : b)),
    );
  }

  function restoreBooking(id: string) {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: "bevestigd" as const } : b)),
    );
  }

  const selectedDayBookings = selectedDay
    ? bookings.filter((b) => b.datum === selectedDay).sort((a, b) => a.tijd.localeCompare(b.tijd))
    : [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Boekingen
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {bookings.filter((b) => b.status !== "geannuleerd").length} actieve afspraken
          </p>
        </div>

        <div className="flex items-center rounded-full border border-border bg-card p-1">
          <ToggleButton active={view === "kalender"} onClick={() => setView("kalender")}>
            <CalendarDays className="size-3.5" />
            Kalender
          </ToggleButton>
          <ToggleButton active={view === "lijst"} onClick={() => setView("lijst")}>
            <Rows3 className="size-3.5" />
            Lijst
          </ToggleButton>
        </div>
      </div>

      {view === "kalender" ? (
        <div className="rounded-2xl border border-border bg-card p-4 shadow-soft sm:p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold capitalize tracking-tight text-foreground">
              {format(month, "MMMM yyyy", { locale: nl })}
            </h2>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  setMonth((m) => subMonths(m, 1));
                  setSelectedDay(null);
                }}
                className="inline-flex size-8 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-muted"
                aria-label="Vorige maand"
              >
                <ChevronLeft className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setMonth((m) => addMonths(m, 1));
                  setSelectedDay(null);
                }}
                className="inline-flex size-8 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-muted"
                aria-label="Volgende maand"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-7 gap-1.5 sm:gap-2">
            {weekdayLabels.map((day) => (
              <div
                key={day}
                className="rounded-lg bg-muted py-1.5 text-center text-[10px] font-semibold tracking-widest text-muted-foreground"
              >
                {day}
              </div>
            ))}

            {days.map((day) => {
              const iso = format(day, "yyyy-MM-dd");
              const dayBookings = bookingsByDay(day);
              const inMonth = isSameMonth(day, month);
              const isSelected = selectedDay === iso;

              return (
                <button
                  key={iso}
                  type="button"
                  disabled={dayBookings.length === 0}
                  onClick={() => setSelectedDay((prev) => (prev === iso ? null : iso))}
                  className={cn(
                    "relative flex aspect-square flex-col items-start justify-start rounded-xl border p-1.5 text-sm transition-colors sm:aspect-[4/3] sm:p-2",
                    inMonth ? "border-border" : "border-transparent opacity-30",
                    isSelected
                      ? "border-foreground bg-foreground text-background"
                      : dayBookings.length > 0
                        ? "bg-background hover:border-foreground/40"
                        : "bg-background",
                    dayBookings.length === 0 && "cursor-default",
                  )}
                >
                  <span className={cn(isToday(day) && !isSelected && "font-bold text-foreground")}>
                    {format(day, "d")}
                  </span>
                  {dayBookings.length > 0 ? (
                    <span
                      className={cn(
                        "absolute bottom-1 right-1 flex size-4 items-center justify-center rounded-full text-[9px] font-bold sm:size-[18px]",
                        isSelected
                          ? "bg-background text-foreground"
                          : "bg-foreground text-background",
                      )}
                    >
                      {dayBookings.length}
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
                    {format(parseISO(selectedDay), "EEEE d MMMM", { locale: nl })}
                  </p>
                  <button
                    type="button"
                    onClick={() => setSelectedDay(null)}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                    aria-label="Sluiten"
                  >
                    <X className="size-4" />
                  </button>
                </div>
                <div className="flex flex-col gap-2">
                  {selectedDayBookings.map((booking) => (
                    <BookingRow
                      key={booking.id}
                      booking={booking}
                      onEdit={() => setEditing(booking)}
                      onCancel={() => cancelBooking(booking.id)}
                      onRestore={() => restoreBooking(booking.id)}
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
                <TableHead className="hidden sm:table-cell">Telefoon</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Acties</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedBookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell className="font-medium text-foreground">{booking.klantnaam}</TableCell>
                  <TableCell className="text-muted-foreground">{booking.dienst}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDatum(booking.datum)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{booking.tijd}</TableCell>
                  <TableCell className="hidden text-muted-foreground sm:table-cell">
                    {booking.telefoonnummer}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={statusVariant[booking.status]}
                      className="rounded-full capitalize"
                    >
                      {booking.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1.5">
                      <Button variant="outline" size="sm" onClick={() => setEditing(booking)}>
                        Bewerken
                      </Button>
                      {booking.status === "geannuleerd" ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => restoreBooking(booking.id)}
                        >
                          Herstel
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => cancelBooking(booking.id)}
                        >
                          Annuleren
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <EditBookingDialog
        booking={editing}
        onOpenChange={(open) => !open && setEditing(null)}
        onSave={(updated) => {
          updateBooking(updated);
          setEditing(null);
        }}
      />
    </div>
  );
}

function ToggleButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors",
        active ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

function BookingRow({
  booking,
  onEdit,
  onCancel,
  onRestore,
}: {
  booking: Booking;
  onEdit: () => void;
  onCancel: () => void;
  onRestore: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border px-4 py-3">
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">{booking.klantnaam}</span>
          <Badge variant={statusVariant[booking.status]} className="rounded-full capitalize">
            {booking.status}
          </Badge>
        </div>
        <span className="text-xs text-muted-foreground">
          {booking.dienst} · {booking.tijd} · {booking.telefoonnummer}
        </span>
      </div>
      <div className="flex gap-1.5">
        <Button variant="outline" size="sm" onClick={onEdit}>
          Bewerken
        </Button>
        {booking.status === "geannuleerd" ? (
          <Button variant="outline" size="sm" onClick={onRestore}>
            Herstel
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={onCancel}
          >
            Annuleren
          </Button>
        )}
      </div>
    </div>
  );
}

function EditBookingDialog({
  booking,
  onOpenChange,
  onSave,
}: {
  booking: Booking | null;
  onOpenChange: (open: boolean) => void;
  onSave: (booking: Booking) => void;
}) {
  const [draft, setDraft] = useState<Booking | null>(booking);

  if (booking && draft?.id !== booking.id) {
    setDraft(booking);
  }

  return (
    <Dialog open={!!booking} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Boeking bewerken</DialogTitle>
        </DialogHeader>

        {draft ? (
          <div className="grid gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="edit-naam">Klantnaam</Label>
              <Input
                id="edit-naam"
                value={draft.klantnaam}
                onChange={(e) => setDraft({ ...draft, klantnaam: e.target.value })}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="edit-telefoon">Telefoonnummer</Label>
              <Input
                id="edit-telefoon"
                value={draft.telefoonnummer}
                onChange={(e) => setDraft({ ...draft, telefoonnummer: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1.5">
                <Label>Dienst</Label>
                <Select
                  value={draft.dienst}
                  onValueChange={(value) => setDraft({ ...draft, dienst: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map((s) => (
                      <SelectItem key={s.name} value={s.name}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label>Status</Label>
                <Select
                  value={draft.status}
                  onValueChange={(value) => setDraft({ ...draft, status: value as BookingStatus })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bevestigd">Bevestigd</SelectItem>
                    <SelectItem value="voltooid">Voltooid</SelectItem>
                    <SelectItem value="geannuleerd">Geannuleerd</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1.5">
                <Label htmlFor="edit-datum">Datum</Label>
                <Input
                  id="edit-datum"
                  type="date"
                  value={draft.datum}
                  onChange={(e) => setDraft({ ...draft, datum: e.target.value })}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="edit-tijd">Tijd</Label>
                <Input
                  id="edit-tijd"
                  type="time"
                  value={draft.tijd}
                  onChange={(e) => setDraft({ ...draft, tijd: e.target.value })}
                />
              </div>
            </div>
          </div>
        ) : null}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuleren
          </Button>
          <Button onClick={() => draft && onSave(draft)}>Opslaan</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
