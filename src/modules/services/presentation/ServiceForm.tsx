"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, X } from "lucide-react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { Button } from "@/app/ui/button";
import { Input } from "@/app/ui/input";
import { Label } from "@/app/ui/label";
import { Textarea } from "@/app/ui/textarea";
import { serviceInputSchema, type ServiceInput } from "../domain/service.schema";

type FormulierWaarden = z.input<typeof serviceInputSchema>;

type ServiceFormProps = {
  /** Beginwaarden; leeg voor een nieuwe dienst. */
  begin?: FormulierWaarden;
  bezig: boolean;
  onOpslaan: (waarden: ServiceInput) => void;
  onAnnuleer: () => void;
};

const LEGE_DIENST: FormulierWaarden = {
  naam: "",
  beschrijving: "",
  prijs: 0,
  duur_minuten: 30,
  actief: true,
};

/** Formulier om een dienst aan te maken of te wijzigen. Valideert met hetzelfde schema als de server. */
export function ServiceForm({
  begin = LEGE_DIENST,
  bezig,
  onOpslaan,
  onAnnuleer,
}: ServiceFormProps) {
  const { register, handleSubmit, formState } = useForm<FormulierWaarden, unknown, ServiceInput>({
    resolver: zodResolver(serviceInputSchema),
    defaultValues: begin,
  });
  const { errors } = formState;

  return (
    <form
      onSubmit={handleSubmit(onOpslaan)}
      noValidate
      className="flex flex-col gap-3 border border-foreground bg-card p-5"
    >
      <div className="grid gap-1.5">
        <Label htmlFor="dienst-naam">Naam</Label>
        <Input
          id="dienst-naam"
          className="rounded-none"
          placeholder="Bijv. Knippen"
          aria-invalid={Boolean(errors.naam)}
          {...register("naam")}
        />
        {errors.naam ? <p className="text-xs text-destructive">{errors.naam.message}</p> : null}
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
            aria-invalid={Boolean(errors.prijs)}
            {...register("prijs", { valueAsNumber: true })}
          />
          {errors.prijs ? <p className="text-xs text-destructive">{errors.prijs.message}</p> : null}
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="dienst-duur">Duur (min)</Label>
          <Input
            id="dienst-duur"
            type="number"
            min="5"
            step="5"
            className="rounded-none"
            aria-invalid={Boolean(errors.duur_minuten)}
            {...register("duur_minuten", { valueAsNumber: true })}
          />
          {errors.duur_minuten ? (
            <p className="text-xs text-destructive">{errors.duur_minuten.message}</p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="dienst-beschrijving">Beschrijving</Label>
        <Textarea
          id="dienst-beschrijving"
          className="rounded-none"
          rows={3}
          {...register("beschrijving")}
        />
        {errors.beschrijving ? (
          <p className="text-xs text-destructive">{errors.beschrijving.message}</p>
        ) : null}
      </div>

      <div className="mt-1 flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="rounded-none"
          disabled={bezig}
          onClick={onAnnuleer}
        >
          <X className="size-3.5" />
          Annuleren
        </Button>
        <Button type="submit" size="sm" className="gap-1.5 rounded-none" disabled={bezig}>
          {bezig ? <Loader2 className="size-3.5 animate-spin" /> : null}
          Opslaan
        </Button>
      </div>
    </form>
  );
}
