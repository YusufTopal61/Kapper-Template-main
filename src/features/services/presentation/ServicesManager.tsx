"use client";

import { Eye, EyeOff, Pencil, Plus, Trash2, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { ServiceForm } from "./ServiceForm";
import type { ServiceUIModel } from "./service.ui-model";
import { useServicesManager } from "./use-services-manager";

export function ServicesManager({ services }: { services: ServiceUIModel[] }) {
  const {
    editingId,
    isCreating,
    error,
    isPending,
    activeCount,
    startCreating,
    cancelCreating,
    startEditing,
    cancelEditing,
    addService,
    updateService,
    setActive,
    requestDelete,
  } = useServicesManager(services);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Diensten
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {services.length} {services.length === 1 ? "dienst" : "diensten"}, waarvan {activeCount}{" "}
            actief
          </p>
        </div>
        <Button onClick={startCreating} disabled={isCreating} className="gap-2 rounded-none">
          <Plus className="size-4" />
          Nieuwe dienst
        </Button>
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

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {isCreating ? (
          <ServiceForm isPending={isPending} onSave={addService} onCancel={cancelCreating} />
        ) : null}

        {services.map((service) =>
          editingId === service.id ? (
            <ServiceForm
              key={service.id}
              initialValues={{
                name: service.name,
                description: service.description,
                price: service.price,
                durationMinutes: service.durationMinutes,
                isActive: service.isActive,
              }}
              isPending={isPending}
              onSave={(values) => updateService(service.id, values)}
              onCancel={cancelEditing}
            />
          ) : (
            <ServiceCard
              key={service.id}
              service={service}
              isPending={isPending}
              onEdit={() => startEditing(service.id)}
              onToggleActive={() => setActive(service.id, !service.isActive)}
              onDelete={() => requestDelete(service)}
            />
          ),
        )}
      </div>

      {services.length === 0 && !isCreating ? (
        <div className="border border-dashed border-border bg-card px-6 py-14 text-center">
          <p className="text-sm text-muted-foreground">Nog geen diensten toegevoegd.</p>
        </div>
      ) : null}
    </div>
  );
}

function ServiceCard({
  service,
  isPending,
  onEdit,
  onToggleActive,
  onDelete,
}: {
  service: ServiceUIModel;
  isPending: boolean;
  onEdit: () => void;
  onToggleActive: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className={cn(
        "flex flex-col justify-between border bg-card p-5",
        service.isActive ? "border-border" : "border-dashed border-border opacity-60",
      )}
    >
      <div>
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-lg font-bold tracking-tight text-foreground">
            {service.name}
          </h3>
          <span className="whitespace-nowrap font-display text-base font-bold text-foreground">
            {service.priceLabel}
          </span>
        </div>
        <p className="mt-0.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {service.durationLabel} {service.isActive ? "" : "· inactief"}
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {service.description || "Nog geen beschrijving."}
        </p>
      </div>

      <div className="mt-5 flex flex-wrap justify-end gap-2 border-t border-border pt-4">
        <Button
          variant="outline"
          size="sm"
          disabled={isPending}
          className="gap-1.5 rounded-none"
          onClick={onToggleActive}
        >
          {service.isActive ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
          {service.isActive ? "Deactiveren" : "Activeren"}
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={isPending}
          className="gap-1.5 rounded-none"
          onClick={onEdit}
        >
          <Pencil className="size-3.5" />
          Bewerken
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={isPending}
          className="gap-1.5 rounded-none text-destructive hover:text-destructive"
          onClick={onDelete}
        >
          <Trash2 className="size-3.5" />
          Verwijderen
        </Button>
      </div>
    </div>
  );
}
