"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, X } from "lucide-react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { serviceInputSchema, type ServiceInput } from "../domain/service.schema";

type FormValues = z.input<typeof serviceInputSchema>;

type ServiceFormProps = {
  /** Beginwaarden; leeg voor een nieuwe dienst. */
  initialValues?: FormValues;
  isPending: boolean;
  onSave: (values: ServiceInput) => void;
  onCancel: () => void;
};

const EMPTY_SERVICE: FormValues = {
  name: "",
  description: "",
  price: 0,
  durationMinutes: 30,
  isActive: true,
};

/** Formulier om een dienst aan te maken of te wijzigen. Valideert met hetzelfde schema als de server. */
export function ServiceForm({
  initialValues = EMPTY_SERVICE,
  isPending,
  onSave,
  onCancel,
}: ServiceFormProps) {
  const { register, handleSubmit, formState } = useForm<FormValues, unknown, ServiceInput>({
    resolver: zodResolver(serviceInputSchema),
    defaultValues: initialValues,
  });
  const { errors } = formState;

  return (
    <form
      onSubmit={handleSubmit(onSave)}
      noValidate
      className="flex flex-col gap-3 border border-foreground bg-card p-5"
    >
      <div className="grid gap-1.5">
        <Label htmlFor="service-name">Naam</Label>
        <Input
          id="service-name"
          className="rounded-none"
          placeholder="Bijv. Knippen"
          aria-invalid={Boolean(errors.name)}
          {...register("name")}
        />
        {errors.name ? <p className="text-xs text-destructive">{errors.name.message}</p> : null}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-1.5">
          <Label htmlFor="service-price">Prijs (€)</Label>
          <Input
            id="service-price"
            type="number"
            min="0"
            step="0.50"
            className="rounded-none"
            aria-invalid={Boolean(errors.price)}
            {...register("price", { valueAsNumber: true })}
          />
          {errors.price ? <p className="text-xs text-destructive">{errors.price.message}</p> : null}
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="service-duration">Duur (min)</Label>
          <Input
            id="service-duration"
            type="number"
            min="5"
            step="5"
            className="rounded-none"
            aria-invalid={Boolean(errors.durationMinutes)}
            {...register("durationMinutes", { valueAsNumber: true })}
          />
          {errors.durationMinutes ? (
            <p className="text-xs text-destructive">{errors.durationMinutes.message}</p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="service-description">Beschrijving</Label>
        <Textarea
          id="service-description"
          className="rounded-none"
          rows={3}
          {...register("description")}
        />
        {errors.description ? (
          <p className="text-xs text-destructive">{errors.description.message}</p>
        ) : null}
      </div>

      <div className="mt-1 flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="rounded-none"
          disabled={isPending}
          onClick={onCancel}
        >
          <X className="size-3.5" />
          Annuleren
        </Button>
        <Button type="submit" size="sm" className="gap-1.5 rounded-none" disabled={isPending}>
          {isPending ? <Loader2 className="size-3.5 animate-spin" /> : null}
          Opslaan
        </Button>
      </div>
    </form>
  );
}
