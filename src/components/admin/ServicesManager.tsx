import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff, Loader2, Pencil, Plus, Trash2, TriangleAlert, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createService, deleteService, fetchAllServices, updateService } from "@/api/services";
import { serviceInputSchema } from "@/lib/validation";
import type { Service } from "@/lib/supabase/types";

type Concept = {
  naam: string;
  beschrijving: string;
  prijs: string;
  duur_minuten: string;
  actief: boolean;
};

const LEEG_CONCEPT: Concept = {
  naam: "",
  beschrijving: "",
  prijs: "0",
  duur_minuten: "30",
  actief: true,
};

const euro = (prijs: number) =>
  new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR" }).format(prijs);

function naarConcept(dienst: Service): Concept {
  return {
    naam: dienst.naam,
    beschrijving: dienst.beschrijving,
    prijs: String(dienst.prijs),
    duur_minuten: String(dienst.duur_minuten),
    actief: dienst.actief,
  };
}

export function ServicesManager() {
  const queryClient = useQueryClient();
  const [bewerktId, setBewerktId] = useState<string | null>(null);
  const [nieuw, setNieuw] = useState<Concept | null>(null);
  const [fout, setFout] = useState<string | null>(null);

  const diensten = useQuery({
    queryKey: ["services", "alle"],
    queryFn: () => fetchAllServices(),
  });

  async function verversen() {
    await queryClient.invalidateQueries({ queryKey: ["services"] });
  }

  const aanmaken = useMutation({
    mutationFn: createService,
    onSuccess: async () => {
      setNieuw(null);
      await verversen();
    },
    onError: () => setFout("De dienst kon niet aangemaakt worden."),
  });

  const bijwerken = useMutation({
    mutationFn: updateService,
    onSuccess: async () => {
      setBewerktId(null);
      await verversen();
    },
    onError: () => setFout("De wijziging kon niet opgeslagen worden."),
  });

  const verwijderen = useMutation({
    mutationFn: deleteService,
    onSuccess: async (resultaat) => {
      if (!resultaat.ok) {
        setFout(resultaat.error);
        return;
      }
      await verversen();
    },
    onError: () => setFout("De dienst kon niet verwijderd worden."),
  });

  const lijst = diensten.data ?? [];
  const bezig = aanmaken.isPending || bijwerken.isPending || verwijderen.isPending;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Diensten
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {diensten.isLoading
              ? "Laden…"
              : `${lijst.length} ${lijst.length === 1 ? "dienst" : "diensten"}, waarvan ${lijst.filter((d) => d.actief).length} actief`}
          </p>
        </div>
        <Button
          onClick={() => {
            setNieuw(LEEG_CONCEPT);
            setBewerktId(null);
            setFout(null);
          }}
          disabled={Boolean(nieuw)}
          className="gap-2 rounded-none"
        >
          <Plus className="size-4" />
          Nieuwe dienst
        </Button>
      </div>

      {fout ? (
        <p className="flex items-start gap-2 border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <TriangleAlert className="mt-0.5 size-4 shrink-0" />
          {fout}
        </p>
      ) : null}

      {diensten.isError ? (
        <p className="border border-dashed border-border bg-card px-6 py-14 text-center text-sm text-muted-foreground">
          De diensten konden niet geladen worden. Ververs de pagina.
        </p>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {nieuw ? (
          <DienstFormulier
            concept={nieuw}
            bezig={aanmaken.isPending}
            onWijzig={setNieuw}
            onAnnuleer={() => setNieuw(null)}
            onOpslaan={(waarden) => {
              setFout(null);
              aanmaken.mutate({ data: waarden });
            }}
            onValidatieFout={setFout}
          />
        ) : null}

        {diensten.isLoading
          ? Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-64 animate-pulse border border-border bg-card" />
            ))
          : lijst.map((dienst) =>
              bewerktId === dienst.id ? (
                <DienstFormulier
                  key={dienst.id}
                  concept={naarConcept(dienst)}
                  bezig={bijwerken.isPending}
                  onAnnuleer={() => setBewerktId(null)}
                  onOpslaan={(waarden) => {
                    setFout(null);
                    bijwerken.mutate({ data: { id: dienst.id, ...waarden } });
                  }}
                  onValidatieFout={setFout}
                />
              ) : (
                <DienstKaart
                  key={dienst.id}
                  dienst={dienst}
                  bezig={bezig}
                  onBewerk={() => {
                    setBewerktId(dienst.id);
                    setNieuw(null);
                    setFout(null);
                  }}
                  onToggleActief={() => {
                    setFout(null);
                    bijwerken.mutate({ data: { id: dienst.id, actief: !dienst.actief } });
                  }}
                  onVerwijder={() => {
                    if (
                      !window.confirm(
                        `"${dienst.naam}" verwijderen? Dit kan niet ongedaan worden gemaakt.`,
                      )
                    ) {
                      return;
                    }
                    setFout(null);
                    verwijderen.mutate({ data: { id: dienst.id } });
                  }}
                />
              ),
            )}
      </div>

      {!diensten.isLoading && lijst.length === 0 && !nieuw ? (
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
  dienst: Service;
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
            {euro(dienst.prijs)}
          </span>
        </div>
        <p className="mt-0.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {dienst.duur_minuten} min {dienst.actief ? "" : "· inactief"}
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

function DienstFormulier({
  concept,
  bezig,
  onWijzig,
  onAnnuleer,
  onOpslaan,
  onValidatieFout,
}: {
  concept: Concept;
  bezig: boolean;
  onWijzig?: (concept: Concept) => void;
  onAnnuleer: () => void;
  onOpslaan: (waarden: {
    naam: string;
    beschrijving: string;
    prijs: number;
    duur_minuten: number;
    actief: boolean;
  }) => void;
  onValidatieFout: (bericht: string) => void;
}) {
  const [lokaal, setLokaal] = useState<Concept>(concept);
  const waarden = onWijzig ? concept : lokaal;

  function zet(veld: keyof Concept, waarde: string | boolean) {
    const volgende = { ...waarden, [veld]: waarde };
    if (onWijzig) onWijzig(volgende);
    else setLokaal(volgende);
  }

  function opslaan() {
    const resultaat = serviceInputSchema.safeParse(waarden);
    if (!resultaat.success) {
      onValidatieFout(resultaat.error.issues[0]?.message ?? "Controleer de ingevulde gegevens.");
      return;
    }
    onOpslaan(resultaat.data);
  }

  return (
    <div className="flex flex-col gap-3 border border-foreground bg-card p-5">
      <div className="grid gap-1.5">
        <Label htmlFor="dienst-naam">Naam</Label>
        <Input
          id="dienst-naam"
          className="rounded-none"
          value={waarden.naam}
          onChange={(e) => zet("naam", e.target.value)}
          placeholder="Bijv. Knippen"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-1.5">
          <Label htmlFor="dienst-prijs">Prijs (€)</Label>
          <Input
            id="dienst-prijs"
            type="number"
            min="0"
            step="0.50"
            className="rounded-none"
            value={waarden.prijs}
            onChange={(e) => zet("prijs", e.target.value)}
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="dienst-duur">Duur (min)</Label>
          <Input
            id="dienst-duur"
            type="number"
            min="5"
            step="5"
            className="rounded-none"
            value={waarden.duur_minuten}
            onChange={(e) => zet("duur_minuten", e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="dienst-beschrijving">Beschrijving</Label>
        <Textarea
          id="dienst-beschrijving"
          className="rounded-none"
          rows={3}
          value={waarden.beschrijving}
          onChange={(e) => zet("beschrijving", e.target.value)}
        />
      </div>

      <div className="mt-1 flex justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          className="rounded-none"
          disabled={bezig}
          onClick={onAnnuleer}
        >
          <X className="size-3.5" />
          Annuleren
        </Button>
        <Button
          size="sm"
          className="gap-1.5 rounded-none"
          disabled={bezig || !waarden.naam.trim()}
          onClick={opslaan}
        >
          {bezig ? <Loader2 className="size-3.5 animate-spin" /> : null}
          Opslaan
        </Button>
      </div>
    </div>
  );
}
