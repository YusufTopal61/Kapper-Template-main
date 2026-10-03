"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import type { z } from "zod";
import { Button } from "@/app/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/app/ui/dialog";
import { Input } from "@/app/ui/input";
import { Label } from "@/app/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/ui/select";
import { Textarea } from "@/app/ui/textarea";
import { adminBookingUpdateSchema, type AdminBookingUpdate } from "../domain/booking.schema";
import type { BookingStatus } from "../domain/booking.entity";
import { statusLabel, type BookingUIModel } from "./booking.uimodel";

const bewerkSchema = adminBookingUpdateSchema.omit({ id: true, klant_email: true });
type BewerkWaarden = z.input<typeof bewerkSchema>;

type BookingEditDialogProps = {
  boeking: BookingUIModel | null;
  diensten: Array<{ id: string; naam: string }>;
  bezig: boolean;
  onSluit: () => void;
  onOpslaan: (wijziging: AdminBookingUpdate) => void;
};

export function BookingEditDialog({
  boeking,
  diensten,
  bezig,
  onSluit,
  onOpslaan,
}: BookingEditDialogProps) {
  return (
    <Dialog open={Boolean(boeking)} onOpenChange={(open) => !open && onSluit()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Boeking bewerken</DialogTitle>
        </DialogHeader>

        {/* De key zorgt dat het formulier met verse waarden begint bij elke andere boeking. */}
        {boeking ? (
          <BewerkFormulier
            key={boeking.id}
            boeking={boeking}
            diensten={diensten}
            bezig={bezig}
            onSluit={onSluit}
            onOpslaan={onOpslaan}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function BewerkFormulier({
  boeking,
  diensten,
  bezig,
  onSluit,
  onOpslaan,
}: Omit<BookingEditDialogProps, "boeking"> & { boeking: BookingUIModel }) {
  const { register, control, handleSubmit, formState } = useForm<BewerkWaarden>({
    resolver: zodResolver(bewerkSchema),
    defaultValues: {
      service_id: boeking.serviceId,
      klant_naam: boeking.klantNaam,
      klant_telefoon: boeking.klantTelefoon,
      datum: boeking.datum,
      tijd: boeking.tijd,
      status: boeking.status,
      notities: boeking.notities ?? "",
    },
  });
  const { errors } = formState;

  const opslaan = handleSubmit((waarden) =>
    onOpslaan({
      id: boeking.id,
      ...waarden,
      // Een leeg veld betekent: notitie wissen.
      notities: waarden.notities?.trim() ? waarden.notities : null,
    }),
  );

  return (
    <form onSubmit={opslaan} noValidate className="grid gap-4">
      <Veld id="bewerk-naam" label="Klantnaam" fout={errors.klant_naam?.message}>
        <Input id="bewerk-naam" {...register("klant_naam")} />
      </Veld>

      <Veld id="bewerk-telefoon" label="Telefoonnummer" fout={errors.klant_telefoon?.message}>
        <Input id="bewerk-telefoon" type="tel" {...register("klant_telefoon")} />
      </Veld>

      <div className="grid grid-cols-2 gap-4">
        <Veld id="bewerk-dienst" label="Dienst" fout={errors.service_id?.message}>
          <Controller
            control={control}
            name="service_id"
            render={({ field }) => (
              <Select value={field.value ?? ""} onValueChange={field.onChange}>
                <SelectTrigger id="bewerk-dienst">
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
            )}
          />
        </Veld>

        <Veld id="bewerk-status" label="Status" fout={errors.status?.message}>
          <Controller
            control={control}
            name="status"
            render={({ field }) => (
              <Select value={field.value ?? ""} onValueChange={field.onChange}>
                <SelectTrigger id="bewerk-status">
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
            )}
          />
        </Veld>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Veld id="bewerk-datum" label="Datum" fout={errors.datum?.message}>
          <Input id="bewerk-datum" type="date" {...register("datum")} />
        </Veld>
        <Veld id="bewerk-tijd" label="Tijd" fout={errors.tijd?.message}>
          <Input id="bewerk-tijd" type="time" {...register("tijd")} />
        </Veld>
      </div>

      <Veld id="bewerk-notities" label="Interne notitie" fout={errors.notities?.message}>
        <Textarea
          id="bewerk-notities"
          rows={3}
          placeholder="Alleen zichtbaar voor jou."
          {...register("notities")}
        />
      </Veld>

      <p className="text-xs text-muted-foreground">
        Verandert de datum, tijd of dienst? Dan krijgt de klant automatisch een mail met de nieuwe
        gegevens.
      </p>

      <DialogFooter>
        <Button type="button" variant="outline" disabled={bezig} onClick={onSluit}>
          Annuleren
        </Button>
        <Button type="submit" className="gap-2" disabled={bezig}>
          {bezig ? <Loader2 className="size-4 animate-spin" /> : null}
          Opslaan
        </Button>
      </DialogFooter>
    </form>
  );
}

function Veld({
  id,
  label,
  fout,
  children,
}: {
  id: string;
  label: string;
  fout: string | undefined;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {fout ? <p className="text-xs text-destructive">{fout}</p> : null}
    </div>
  );
}
