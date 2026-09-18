import { useState } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { services as initialServices, type Service } from "@/lib/site-data";

type DraftService = Service & { id: string };

function withIds(list: Service[]): DraftService[] {
  return list.map((s, i) => ({ ...s, id: `svc-${i}-${s.name}` }));
}

function blankService(): DraftService {
  return {
    id: `svc-${Date.now()}`,
    name: "",
    price: "€ 00",
    duration: "30 min",
    description: "",
    includes: [],
  };
}

export function ServicesManager() {
  const [services, setServices] = useState<DraftService[]>(() => withIds(initialServices));
  const [editingId, setEditingId] = useState<string | null>(null);

  function addService() {
    const draft = blankService();
    setServices((prev) => [...prev, draft]);
    setEditingId(draft.id);
  }

  function saveService(updated: DraftService) {
    setServices((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    setEditingId(null);
  }

  function removeService(id: string) {
    if (!window.confirm("Deze dienst verwijderen? Dit kan niet ongedaan worden gemaakt.")) return;
    setServices((prev) => prev.filter((s) => s.id !== id));
    if (editingId === id) setEditingId(null);
  }

  function cancelEdit(id: string, wasNew: boolean) {
    if (wasNew) {
      setServices((prev) => prev.filter((s) => s.id !== id));
    }
    setEditingId(null);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Diensten
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {services.length} {services.length === 1 ? "dienst" : "diensten"} in het aanbod
          </p>
        </div>
        <Button onClick={addService} className="gap-2 rounded-none">
          <Plus className="size-4" />
          Nieuwe dienst
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {services.map((service) => (
          <ServiceCard
            key={service.id}
            service={service}
            editing={editingId === service.id}
            onEdit={() => setEditingId(service.id)}
            onCancelEdit={(wasNew) => cancelEdit(service.id, wasNew)}
            onSave={saveService}
            onRemove={() => removeService(service.id)}
            isNew={service.name === "" && editingId === service.id}
          />
        ))}
      </div>

      {services.length === 0 ? (
        <div className="rounded-none border border-dashed border-border bg-card px-6 py-14 text-center">
          <p className="text-sm text-muted-foreground">Nog geen diensten toegevoegd.</p>
        </div>
      ) : null}
    </div>
  );
}

function ServiceCard({
  service,
  editing,
  onEdit,
  onCancelEdit,
  onSave,
  onRemove,
  isNew,
}: {
  service: DraftService;
  editing: boolean;
  onEdit: () => void;
  onCancelEdit: (wasNew: boolean) => void;
  onSave: (service: DraftService) => void;
  onRemove: () => void;
  isNew: boolean;
}) {
  const [draft, setDraft] = useState<DraftService>(service);

  if (editing && draft.id !== service.id) {
    setDraft(service);
  }

  if (editing) {
    return (
      <div className="flex flex-col gap-3 border border-foreground bg-card p-5">
        <div className="grid gap-1.5">
          <Label htmlFor={`name-${service.id}`}>Naam</Label>
          <Input
            id={`name-${service.id}`}
            className="rounded-none"
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            placeholder="Bijv. Knippen"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-1.5">
            <Label htmlFor={`price-${service.id}`}>Prijs</Label>
            <Input
              id={`price-${service.id}`}
              className="rounded-none"
              value={draft.price}
              onChange={(e) => setDraft({ ...draft, price: e.target.value })}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor={`duration-${service.id}`}>Duur</Label>
            <Input
              id={`duration-${service.id}`}
              className="rounded-none"
              value={draft.duration}
              onChange={(e) => setDraft({ ...draft, duration: e.target.value })}
            />
          </div>
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor={`desc-${service.id}`}>Beschrijving</Label>
          <Textarea
            id={`desc-${service.id}`}
            className="rounded-none"
            rows={3}
            value={draft.description}
            onChange={(e) => setDraft({ ...draft, description: e.target.value })}
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor={`includes-${service.id}`}>Inbegrepen (komma-gescheiden)</Label>
          <Input
            id={`includes-${service.id}`}
            className="rounded-none"
            value={draft.includes.join(", ")}
            onChange={(e) =>
              setDraft({
                ...draft,
                includes: e.target.value
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean),
              })
            }
          />
        </div>
        <div className="mt-1 flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            className="rounded-none"
            onClick={() => onCancelEdit(isNew)}
          >
            <X className="size-3.5" />
            Annuleren
          </Button>
          <Button
            size="sm"
            className="rounded-none"
            disabled={!draft.name.trim()}
            onClick={() => onSave(draft)}
          >
            Opslaan
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="group flex flex-col justify-between border border-border bg-card p-5">
      <div>
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-lg font-bold tracking-tight text-foreground">
            {service.name || "Naamloze dienst"}
          </h3>
          <span className="whitespace-nowrap font-display text-base font-bold text-foreground">
            {service.price}
          </span>
        </div>
        <p className="mt-0.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {service.duration}
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {service.description || "Nog geen beschrijving."}
        </p>
        {service.includes.length > 0 ? (
          <ul className="mt-4 flex flex-wrap gap-1.5">
            {service.includes.map((item) => (
              <li
                key={item}
                className="rounded-none border border-border px-2 py-1 text-[11px] text-muted-foreground"
              >
                {item}
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <div className={cn("mt-5 flex justify-end gap-2 border-t border-border pt-4")}>
        <Button variant="outline" size="sm" className="gap-1.5 rounded-none" onClick={onEdit}>
          <Pencil className="size-3.5" />
          Bewerken
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 rounded-none text-destructive hover:text-destructive"
          onClick={onRemove}
        >
          <Trash2 className="size-3.5" />
          Verwijderen
        </Button>
      </div>
    </div>
  );
}
