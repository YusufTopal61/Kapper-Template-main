"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ServiceInput } from "../domain/service.schema";
import { createServiceAction, deleteServiceAction, updateServiceAction } from "./service.actions";
import type { ServiceUIModel } from "./service.ui-model";

type Outcome = { ok: true } | { ok: false; error: string };

/**
 * View model van het dienstenbeheer: welke kaart wordt bewerkt, een nieuwe
 * dienst toevoegen, en de beheeracties. De lijst komt van de server; na elke
 * wijziging vragen we een verse versie (router.refresh).
 */
export function useServicesManager(services: ServiceUIModel[]) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

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
    editingId,
    isCreating,
    error,
    isPending,
    activeCount: services.filter((service) => service.isActive).length,
    startCreating: () => {
      setIsCreating(true);
      setEditingId(null);
      setError(null);
    },
    cancelCreating: () => setIsCreating(false),
    startEditing: (id: string) => {
      setEditingId(id);
      setIsCreating(false);
      setError(null);
    },
    cancelEditing: () => setEditingId(null),
    addService: (values: ServiceInput) =>
      run(
        () => createServiceAction(values),
        () => setIsCreating(false),
      ),
    updateService: (id: string, values: ServiceInput) =>
      run(
        () => updateServiceAction({ id, ...values }),
        () => setEditingId(null),
      ),
    setActive: (id: string, isActive: boolean) => run(() => updateServiceAction({ id, isActive })),
    requestDelete: (service: ServiceUIModel) => {
      if (!window.confirm(`"${service.name}" verwijderen? Dit kan niet ongedaan worden gemaakt.`)) {
        return;
      }
      run(() => deleteServiceAction({ id: service.id }));
    },
  };
}
