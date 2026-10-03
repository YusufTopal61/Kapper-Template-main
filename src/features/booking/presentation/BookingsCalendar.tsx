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
import { cn } from "@/shared/lib/utils";
import { Badge } from "@/app/ui/badge";
import { Button } from "@/app/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/ui/table";
import { parseDatum } from "@/modules/settings/domain/opening-hours.rules";
import { BookingEditDialog } from "./BookingEditDialog";
import type { BookingUIModel } from "./booking.uimodel";
import { useBookingsCalendar } from "./useBookingsCalendar";

const WEEKDAGEN = ["MA", "DI", "WO", "DO", "VR", "ZA", "ZO"];

type BookingsCalendarProps = {
  boekingen: BookingUIModel[];
  diensten: Array<{ id: string; naam: string }>;
};

export function BookingsCalendar({ boekingen, diensten }: BookingsCalendarProps) {
  const {
    weergave,
    setWeergave,
    maand,
    dagen,
    gekozenDag,
    bewerkt,
    fout,
    bezig,
    aantalActief,
    actieveOpDag,
    dagBoekingen,
    kiesDag,
    sluitDag,
    vorigeMaand,
    volgendeMaand,
    bewerk,
    sluitBewerken,
    markeerVoltooid,
    annuleer,
    opslaan,
  } = useBookingsCalendar(boekingen);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Boekingen
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{aantalActief} actieve afspraken</p>
        </div>

        <div className="flex items-center rounded-full border border-border bg-card p-1">
          <ToggleKnop actief={weergave === "kalender"} onClick={() => setWeergave("kalender")}>
            <CalendarDays className="size-3.5" />
            Kalender
          </ToggleKnop>
          <ToggleKnop actief={weergave === "lijst"} onClick={() => setWeergave("lijst")}>
            <Rows3 className="size-3.5" />
            Lijst
          </ToggleKnop>
        </div>
      </div>

      {fout ? (
        <p
          role="alert"
          className="flex items-start gap-2 border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          <TriangleAlert className="mt-0.5 size-4 shrink-0" />
          {fout}
        </p>
      ) : null}

      {weergave === "kalender" ? (
        <div className="rounded-2xl border border-border bg-card p-4 shadow-soft sm:p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold capitalize tracking-tight text-foreground">
              {format(maand, "MMMM yyyy", { locale: nl })}
            </h2>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={vorigeMaand}
                className="inline-flex size-8 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-muted"
                aria-label="Vorige maand"
              >
                <ChevronLeft className="size-4" />
              </button>
              <button
                type="button"
                onClick={volgendeMaand}
                className="inline-flex size-8 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-muted"
                aria-label="Volgende maand"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-7 gap-1.5 sm:gap-2">
            {WEEKDAGEN.map((dag) => (
              <div
                key={dag}
                className="rounded-lg bg-muted py-1.5 text-center text-[10px] font-semibold tracking-widest text-muted-foreground"
              >
                {dag}
              </div>
            ))}

            {dagen.map(({ datum, iso }) => {
              const aantal = actieveOpDag(iso).length;
              const inMaand = isSameMonth(datum, maand);
              const gekozen = gekozenDag === iso;

              return (
                <button
                  key={iso}
                  type="button"
                  disabled={aantal === 0}
                  onClick={() => kiesDag(iso)}
                  aria-label={`${format(datum, "d MMMM", { locale: nl })}, ${aantal} afspraken`}
                  className={cn(
                    "relative flex aspect-square flex-col items-start justify-start rounded-xl border p-1.5 text-sm transition-colors sm:aspect-[4/3] sm:p-2",
                    inMaand ? "border-border" : "border-transparent opacity-30",
                    gekozen
                      ? "border-foreground bg-foreground text-background"
                      : aantal > 0
                        ? "bg-background hover:border-foreground/40"
                        : "bg-background",
                    aantal === 0 && "cursor-default",
                  )}
                >
                  <span className={cn(isToday(datum) && !gekozen && "font-bold text-foreground")}>
                    {format(datum, "d")}
                  </span>
                  {aantal > 0 ? (
                    <span
                      className={cn(
                        "absolute bottom-1 right-1 flex size-4 items-center justify-center rounded-full text-[9px] font-bold sm:size-[18px]",
                        gekozen ? "bg-background text-foreground" : "bg-foreground text-background",
                      )}
                    >
                      {aantal}
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
                    onClick={sluitDag}
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
                      onBewerk={() => bewerk(boeking)}
                      onVoltooi={() => markeerVoltooid(boeking.id)}
                      onAnnuleer={() => annuleer(boeking.id)}
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
              {boekingen.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-14 text-center text-muted-foreground">
                    Nog geen boekingen.
                  </TableCell>
                </TableRow>
              ) : (
                boekingen.map((boeking) => (
                  <TableRow key={boeking.id}>
                    <TableCell className="font-medium text-foreground">
                      <span className="flex items-center gap-1.5">
                        {boeking.klantNaam}
                        {boeking.notities ? (
                          <StickyNote
                            className="size-3.5 text-muted-foreground"
                            aria-label="Heeft interne notitie"
                          />
                        ) : null}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{boeking.dienstNaam}</TableCell>
                    <TableCell className="text-muted-foreground">{boeking.datumLabel}</TableCell>
                    <TableCell className="text-muted-foreground">{boeking.tijd}</TableCell>
                    <TableCell className="hidden text-muted-foreground lg:table-cell">
                      {boeking.klantTelefoon}
                    </TableCell>
                    <TableCell>
                      <Badge variant={boeking.statusVariant} className="rounded-full">
                        {boeking.statusLabel}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={bezig}
                          onClick={() => bewerk(boeking)}
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
                              onClick={() => annuleer(boeking.id)}
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
        boeking={bewerkt}
        diensten={diensten}
        bezig={bezig}
        onSluit={sluitBewerken}
        onOpslaan={opslaan}
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
      aria-pressed={actief}
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
  boeking: BookingUIModel;
  bezig: boolean;
  onBewerk: () => void;
  onVoltooi: () => void;
  onAnnuleer: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border px-4 py-3">
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">{boeking.klantNaam}</span>
          <Badge variant={boeking.statusVariant} className="rounded-full">
            {boeking.statusLabel}
          </Badge>
        </div>
        <span className="text-xs text-muted-foreground">
          {boeking.dienstNaam} · {boeking.tijd} · {boeking.klantTelefoon}
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
