"use client";

import { Eye, EyeOff, Pencil, Plus, Trash2, TriangleAlert } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/app/ui/button";
import { ServiceForm } from "./ServiceForm";
import type { ServiceUIModel } from "./service.uimodel";
import { useServicesManager } from "./useServicesManager";

export function ServicesManager({ diensten }: { diensten: ServiceUIModel[] }) {
  const {
    bewerktId,
    nieuw,
    fout,
    bezig,
    aantalActief,
    startNieuw,
    annuleerNieuw,
    startBewerken,
    annuleerBewerken,
    maakAan,
    werkBij,
    zetActief,
    verwijder,
  } = useServicesManager(diensten);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Diensten
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {diensten.length} {diensten.length === 1 ? "dienst" : "diensten"}, waarvan{" "}
            {aantalActief} actief
          </p>
        </div>
        <Button onClick={startNieuw} disabled={nieuw} className="gap-2 rounded-none">
          <Plus className="size-4" />
          Nieuwe dienst
        </Button>
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

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {nieuw ? (
          <ServiceForm bezig={bezig} onOpslaan={maakAan} onAnnuleer={annuleerNieuw} />
        ) : null}

        {diensten.map((dienst) =>
          bewerktId === dienst.id ? (
            <ServiceForm
              key={dienst.id}
              begin={{
                naam: dienst.naam,
                beschrijving: dienst.beschrijving,
                prijs: dienst.prijs,
                duur_minuten: dienst.duurMinuten,
                actief: dienst.actief,
              }}
              bezig={bezig}
              onOpslaan={(waarden) => werkBij(dienst.id, waarden)}
              onAnnuleer={annuleerBewerken}
            />
          ) : (
            <DienstKaart
              key={dienst.id}
              dienst={dienst}
              bezig={bezig}
              onBewerk={() => startBewerken(dienst.id)}
              onToggleActief={() => zetActief(dienst.id, !dienst.actief)}
              onVerwijder={() => verwijder(dienst)}
            />
          ),
        )}
      </div>

      {diensten.length === 0 && !nieuw ? (
        <div className="border border-dashed border-border bg-card px-6 py-14 text-center">
          <p className="text-sm text-muted-foreground">Nog geen diensten toegevoegd.</p>
        </div>
      ) : null}
    </div>
  );
}

function DienstKaart({
  dienst,
  bezig,
  onBewerk,
  onToggleActief,
  onVerwijder,
}: {
  dienst: ServiceUIModel;
  bezig: boolean;
  onBewerk: () => void;
  onToggleActief: () => void;
  onVerwijder: () => void;
}) {
  return (
    <div
      className={cn(
        "flex flex-col justify-between border bg-card p-5",
        dienst.actief ? "border-border" : "border-dashed border-border opacity-60",
      )}
    >
      <div>
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-lg font-bold tracking-tight text-foreground">
            {dienst.naam}
          </h3>
          <span className="whitespace-nowrap font-display text-base font-bold text-foreground">
            {dienst.prijsLabel}
          </span>
        </div>
        <p className="mt-0.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {dienst.duurLabel} {dienst.actief ? "" : "· inactief"}
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {dienst.beschrijving || "Nog geen beschrijving."}
        </p>
      </div>

      <div className="mt-5 flex flex-wrap justify-end gap-2 border-t border-border pt-4">
        <Button
          variant="outline"
          size="sm"
          disabled={bezig}
          className="gap-1.5 rounded-none"
          onClick={onToggleActief}
        >
          {dienst.actief ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
          {dienst.actief ? "Deactiveren" : "Activeren"}
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={bezig}
          className="gap-1.5 rounded-none"
          onClick={onBewerk}
        >
          <Pencil className="size-3.5" />
          Bewerken
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={bezig}
          className="gap-1.5 rounded-none text-destructive hover:text-destructive"
          onClick={onVerwijder}
        >
          <Trash2 className="size-3.5" />
          Verwijderen
        </Button>
      </div>
    </div>
  );
}
