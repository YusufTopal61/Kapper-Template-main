"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ServiceInput } from "../domain/service.schema";
import { createServiceAction, deleteServiceAction, updateServiceAction } from "./service.actions";
import type { ServiceUIModel } from "./service.uimodel";

type Uitkomst = { ok: true } | { ok: false; error: string };

/**
 * View model van het dienstenbeheer: welke kaart wordt bewerkt, een nieuwe
 * dienst toevoegen, en de beheeracties. De lijst komt van de server; na elke
 * wijziging vragen we een verse versie (router.refresh).
 */
export function useServicesManager(diensten: ServiceUIModel[]) {
  const router = useRouter();
  const [bewerktId, setBewerktId] = useState<string | null>(null);
  const [nieuw, setNieuw] = useState(false);
  const [fout, setFout] = useState<string | null>(null);
  const [bezig, startTransition] = useTransition();

  function voerUit(actie: () => Promise<Uitkomst>, naSucces?: () => void) {
    setFout(null);
    startTransition(async () => {
      try {
        const uitkomst = await actie();
        if (!uitkomst.ok) {
          setFout(uitkomst.error);
          return;
        }
        naSucces?.();
        router.refresh();
      } catch {
        setFout("Dit kon niet worden opgeslagen. Probeer het zo nog eens.");
      }
    });
  }

  return {
    bewerktId,
    nieuw,
    fout,
    bezig,
    aantalActief: diensten.filter((dienst) => dienst.actief).length,
    startNieuw: () => {
      setNieuw(true);
      setBewerktId(null);
      setFout(null);
    },
    annuleerNieuw: () => setNieuw(false),
    startBewerken: (id: string) => {
      setBewerktId(id);
      setNieuw(false);
      setFout(null);
    },
    annuleerBewerken: () => setBewerktId(null),
    maakAan: (waarden: ServiceInput) =>
      voerUit(
        () => createServiceAction(waarden),
        () => setNieuw(false),
      ),
    werkBij: (id: string, waarden: ServiceInput) =>
      voerUit(
        () => updateServiceAction({ id, ...waarden }),
        () => setBewerktId(null),
      ),
    zetActief: (id: string, actief: boolean) => voerUit(() => updateServiceAction({ id, actief })),
    verwijder: (dienst: ServiceUIModel) => {
      if (!window.confirm(`"${dienst.naam}" verwijderen? Dit kan niet ongedaan worden gemaakt.`)) {
        return;
      }
      voerUit(() => deleteServiceAction({ id: dienst.id }));
    },
  };
}
