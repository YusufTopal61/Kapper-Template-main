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
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { nl } from "date-fns/locale";
import { motion, AnimatePresence } from "motion/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Rows3,
  StickyNote,
  TriangleAlert,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { cancelBookingAdmin, fetchAdminBookings, updateBooking } from "@/api/bookings";
import { fetchAllServices } from "@/api/services";
import { normaliseerTijd, parseDatum } from "@/lib/opening-hours";
import type { BookingStatus, BookingWithService } from "@/lib/supabase/types";

const weekdagen = ["MA", "DI", "WO", "DO", "VR", "ZA", "ZO"];

const statusVariant: Record<BookingStatus, "default" | "secondary" | "destructive" | "outline"> = {
  bevestigd: "default",
  voltooid: "secondary",
  geannuleerd: "destructive",
  no_show: "outline",
};

const statusLabel: Record<BookingStatus, string> = {
  bevestigd: "Bevestigd",
  voltooid: "Voltooid",
  geannuleerd: "Geannuleerd",
  no_show: "No-show",
};

const formatDatumKort = (datum: string) => format(parseDatum(datum), "d MMM yyyy", { locale: nl });

export function BookingsCalendar() {
  const queryClient = useQueryClient();
  const [view, setView] = useState<"kalender" | "lijst">("kalender");
  const [maand, setMaand] = useState(() => startOfMonth(new Date()));
  const [gekozenDag, setGekozenDag] = useState<string | null>(null);
  const [bewerkt, setBewerkt] = useState<BookingWithService | null>(null);
  const [fout, setFout] = useState<string | null>(null);

  const boekingen = useQuery({
    queryKey: ["bookings"],
    queryFn: () => fetchAdminBookings(),
  });

  const diensten = useQuery({
    queryKey: ["services", "alle"],
    queryFn: () => fetchAllServices(),
  });

  async function verversen() {
    await queryClient.invalidateQueries({ queryKey: ["bookings"] });
  }

  const wijzigen = useMutation({
    mutationFn: updateBooking,
    onSuccess: async (resultaat) => {
      if (!resultaat.ok) {
        setFout(resultaat.error);
        return;
      }
      setBewerkt(null);
      await verversen();
    },
    onError: () => setFout("De wijziging kon niet opgeslagen worden."),
  });

  const annuleren = useMutation({
    mutationFn: cancelBookingAdmin,
    onSuccess: async (resultaat) => {
      if (!resultaat.ok) {
        setFout(resultaat.error);
        return;
      }
      await verversen();
    },
    onError: () => setFout("De afspraak kon niet geannuleerd worden."),
  });

  const lijst = boekingen.data ?? [];
  const bezig = wijzigen.isPending || annuleren.isPending;

  const dagen = useMemo(() => {
    const start = startOfWeek(startOfMonth(maand), { weekStartsOn: 1 });
    const eind = endOfWeek(endOfMonth(maand), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end: eind });
  }, [maand]);

  const boekingenOpDag = (dag: Date) =>
    lijst
      .filter((b) => isSameDay(parseDatum(b.datum), dag))
      .sort((a, b) => a.tijd.localeCompare(b.tijd));

  const dagBoekingen = gekozenDag
    ? lijst.filter((b) => b.datum === gekozenDag).sort((a, b) => a.tijd.localeCompare(b.tijd))
    : [];

  function markeerVoltooid(id: string) {
    setFout(null);
    wijzigen.mutate({ data: { id, status: "voltooid" } });
  }

  function annuleerBoeking(id: string) {
    if (!window.confirm("Deze afspraak annuleren? De klant krijgt hiervan bericht per e-mail.")) {
      return;
    }
    setFout(null);
    annuleren.mutate({ data: { id } });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Boekingen
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {boekingen.isLoading
              ? "Laden…"
              : `${lijst.filter((b) => b.status !== "geannuleerd").length} actieve afspraken`}
          </p>
        </div>

        <div className="flex items-center rounded-full border border-border bg-card p-1">
          <ToggleKnop actief={view === "kalender"} onClick={() => setView("kalender")}>
            <CalendarDays className="size-3.5" />
            Kalender
          </ToggleKnop>
          <ToggleKnop actief={view === "lijst"} onClick={() => setView("lijst")}>
            <Rows3 className="size-3.5" />
            Lijst
          </ToggleKnop>
        </div>
      </div>

      {fout ? (
        <p className="flex items-start gap-2 border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <TriangleAlert className="mt-0.5 size-4 shrink-0" />
          {fout}
        </p>
      ) : null}

      {boekingen.isError ? (
        <p className="rounded-2xl border border-dashed border-border bg-card px-6 py-14 text-center text-sm text-muted-foreground">
          De boekingen konden niet geladen worden. Ververs de pagina.
        </p>
      ) : boekingen.isLoading ? (
        <div className="h-96 animate-pulse rounded-2xl border border-border bg-card" />
      ) : view === "kalender" ? (
        <div className="rounded-2xl border border-border bg-card p-4 shadow-soft sm:p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold capitalize tracking-tight text-foreground">
              {format(maand, "MMMM yyyy", { locale: nl })}
            </h2>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  setMaand((m) => subMonths(m, 1));
                  setGekozenDag(null);
                }}
                className="inline-flex size-8 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-muted"
                aria-label="Vorige maand"
              >
                <ChevronLeft className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setMaand((m) => addMonths(m, 1));
                  setGekozenDag(null);
                }}
                className="inline-flex size-8 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-muted"
                aria-label="Volgende maand"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-7 gap-1.5 sm:gap-2">
            {weekdagen.map((dag) => (
              <div
                key={dag}
                className="rounded-lg bg-muted py-1.5 text-center text-[10px] font-semibold tracking-widest text-muted-foreground"
              >
                {dag}
              </div>
            ))}

            {dagen.map((dag) => {
              const iso = format(dag, "yyyy-MM-dd");
              const dagLijst = boekingenOpDag(dag).filter((b) => b.status !== "geannuleerd");
              const inMaand = isSameMonth(dag, maand);
              const gekozen = gekozenDag === iso;

              return (
                <button
                  key={iso}
                  type="button"
                  disabled={dagLijst.length === 0}
                  onClick={() => setGekozenDag((vorige) => (vorige === iso ? null : iso))}
                  className={cn(
                    "relative flex aspect-square flex-col items-start justify-start rounded-xl border p-1.5 text-sm transition-colors sm:aspect-[4/3] sm:p-2",
                    inMaand ? "border-border" : "border-transparent opacity-30",
                    gekozen
                      ? "border-foreground bg-foreground text-background"
                      : dagLijst.length > 0
                        ? "bg-background hover:border-foreground/40"
                        : "bg-background",
                    dagLijst.length === 0 && "cursor-default",
                  )}
                >
                  <span className={cn(isToday(dag) && !gekozen && "font-bold text-foreground")}>
                    {format(dag, "d")}
                  </span>
                  {dagLijst.length > 0 ? (
                    <span
                      className={cn(
                        "absolute bottom-1 right-1 flex size-4 items-center justify-center rounded-full text-[9px] font-bold sm:size-[18px]",
                        gekozen ? "bg-background text-foreground" : "bg-foreground text-background",
                      )}
                    >
                      {dagLijst.length}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>

          <AnimatePresence mode="wait">
            {gekozenDag ? (
              <motion.div
                key={gekozenDag}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="mt-5 overflow-hidden border-t border-border pt-5"
              >
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    {format(parseDatum(gekozenDag), "EEEE d MMMM", { locale: nl })}
                  </p>
                  <button
                    type="button"
                    onClick={() => setGekozenDag(null)}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                    aria-label="Sluiten"
                  >
                    <X className="size-4" />
                  </button>
                </div>
                <div className="flex flex-col gap-2">
                  {dagBoekingen.map((boeking) => (
                    <BoekingRegel
                      key={boeking.id}
                      boeking={boeking}
                      bezig={bezig}
                      onBewerk={() => setBewerkt(boeking)}
                      onVoltooi={() => markeerVoltooid(boeking.id)}
                      onAnnuleer={() => annuleerBoeking(boeking.id)}
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
              {lijst.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-14 text-center text-muted-foreground">
                    Nog geen boekingen.
                  </TableCell>
                </TableRow>
              ) : (
                lijst.map((boeking) => (
                  <TableRow key={boeking.id}>
                    <TableCell className="font-medium text-foreground">
                      <span className="flex items-center gap-1.5">
                        {boeking.klant_naam}
                        {boeking.notities ? (
                          <StickyNote
                            className="size-3.5 text-muted-foreground"
                            aria-label="Heeft interne notitie"
                          />
                        ) : null}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {boeking.services?.naam ?? "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDatumKort(boeking.datum)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {normaliseerTijd(boeking.tijd)}
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground lg:table-cell">
                      {boeking.klant_telefoon}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant[boeking.status]} className="rounded-full">
                        {statusLabel[boeking.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={bezig}
                          onClick={() => setBewerkt(boeking)}
                        >
                          Bewerken
                        </Button>
                        {boeking.status === "bevestigd" ? (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={bezig}
                              onClick={() => markeerVoltooid(boeking.id)}
                            >
                              Voltooid
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={bezig}
                              className="text-destructive hover:text-destructive"
                              onClick={() => annuleerBoeking(boeking.id)}
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

      <BewerkDialoog
        boeking={bewerkt}
        diensten={diensten.data ?? []}
        bezig={wijzigen.isPending}
        onSluit={() => setBewerkt(null)}
        onOpslaan={(velden) => {
          setFout(null);
          wijzigen.mutate({ data: velden });
        }}
      />
    </div>
  );
}

function ToggleKnop({
  actief,
  onClick,
  children,
}: {
  actief: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors",
        actief ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

function BoekingRegel({
  boeking,
  bezig,
  onBewerk,
  onVoltooi,
  onAnnuleer,
}: {
  boeking: BookingWithService;
  bezig: boolean;
  onBewerk: () => void;
  onVoltooi: () => void;
  onAnnuleer: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border px-4 py-3">
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">{boeking.klant_naam}</span>
          <Badge variant={statusVariant[boeking.status]} className="rounded-full">
            {statusLabel[boeking.status]}
          </Badge>
        </div>
        <span className="text-xs text-muted-foreground">
          {boeking.services?.naam ?? "—"} · {normaliseerTijd(boeking.tijd)} ·{" "}
          {boeking.klant_telefoon}
        </span>
        {boeking.notities ? (
          <span className="mt-1 flex items-start gap-1.5 text-xs italic text-muted-foreground">
            <StickyNote className="mt-0.5 size-3 shrink-0" />
            {boeking.notities}
          </span>
        ) : null}
      </div>
      <div className="flex gap-1.5">
        <Button variant="outline" size="sm" disabled={bezig} onClick={onBewerk}>
          Bewerken
        </Button>
        {boeking.status === "bevestigd" ? (
          <>
            <Button variant="outline" size="sm" disabled={bezig} onClick={onVoltooi}>
              <Check className="size-3.5" />
              Voltooid
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={bezig}
              className="text-destructive hover:text-destructive"
              onClick={onAnnuleer}
            >
              Annuleren
            </Button>
          </>
        ) : null}
      </div>
    </div>
  );
}

type BewerkVelden = {
  id: string;
  service_id: string;
  klant_naam: string;
  klant_telefoon: string;
  datum: string;
  tijd: string;
  status: BookingStatus;
  notities: string | null;
};

function BewerkDialoog({
  boeking,
  diensten,
  bezig,
  onSluit,
  onOpslaan,
}: {
  boeking: BookingWithService | null;
  diensten: Array<{ id: string; naam: string }>;
  bezig: boolean;
  onSluit: () => void;
  onOpslaan: (velden: BewerkVelden) => void;
}) {
  const [concept, setConcept] = useState<BewerkVelden | null>(null);

  // Verse waarden zodra er een andere boeking geopend wordt.
  if (boeking && concept?.id !== boeking.id) {
    setConcept({
      id: boeking.id,
      service_id: boeking.service_id,
      klant_naam: boeking.klant_naam,
      klant_telefoon: boeking.klant_telefoon,
      datum: boeking.datum,
      tijd: normaliseerTijd(boeking.tijd),
      status: boeking.status,
      notities: boeking.notities,
    });
  }

  return (
    <Dialog open={Boolean(boeking)} onOpenChange={(open) => !open && onSluit()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Boeking bewerken</DialogTitle>
        </DialogHeader>

        {concept ? (
          <div className="grid gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="bewerk-naam">Klantnaam</Label>
              <Input
                id="bewerk-naam"
                value={concept.klant_naam}
                onChange={(e) => setConcept({ ...concept, klant_naam: e.target.value })}
              />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="bewerk-telefoon">Telefoonnummer</Label>
              <Input
                id="bewerk-telefoon"
                value={concept.klant_telefoon}
                onChange={(e) => setConcept({ ...concept, klant_telefoon: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1.5">
                <Label>Dienst</Label>
                <Select
                  value={concept.service_id}
                  onValueChange={(waarde) => setConcept({ ...concept, service_id: waarde })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {diensten.map((dienst) => (
                      <SelectItem key={dienst.id} value={dienst.id}>
                        {dienst.naam}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-1.5">
                <Label>Status</Label>
                <Select
                  value={concept.status}
                  onValueChange={(waarde) =>
                    setConcept({ ...concept, status: waarde as BookingStatus })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(statusLabel) as BookingStatus[]).map((status) => (
                      <SelectItem key={status} value={status}>
                        {statusLabel[status]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1.5">
                <Label htmlFor="bewerk-datum">Datum</Label>
                <Input
                  id="bewerk-datum"
                  type="date"
                  value={concept.datum}
                  onChange={(e) => setConcept({ ...concept, datum: e.target.value })}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="bewerk-tijd">Tijd</Label>
                <Input
                  id="bewerk-tijd"
                  type="time"
                  value={concept.tijd}
                  onChange={(e) => setConcept({ ...concept, tijd: e.target.value })}
                />
              </div>
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="bewerk-notities">Interne notitie</Label>
              <Textarea
                id="bewerk-notities"
                rows={3}
                placeholder="Alleen zichtbaar voor jou."
                value={concept.notities ?? ""}
                onChange={(e) => setConcept({ ...concept, notities: e.target.value || null })}
              />
            </div>

            <p className="text-xs text-muted-foreground">
              Verandert de datum, tijd of dienst? Dan krijgt de klant automatisch een mail met de
              nieuwe gegevens.
            </p>
          </div>
        ) : null}

        <DialogFooter>
          <Button variant="outline" disabled={bezig} onClick={onSluit}>
            Annuleren
          </Button>
          <Button
            className="gap-2"
            disabled={bezig || !concept}
            onClick={() => concept && onOpslaan(concept)}
          >
            {bezig ? <Loader2 className="size-4 animate-spin" /> : null}
            Opslaan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
