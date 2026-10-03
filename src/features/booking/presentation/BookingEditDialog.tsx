"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { adminBookingUpdateSchema, type AdminBookingUpdate } from "../domain/booking.schema";
import type { BookingStatus } from "../domain/booking.entity";
import { statusLabel, type BookingUIModel } from "./booking.ui-model";

const editSchema = adminBookingUpdateSchema.omit({ id: true, customerEmail: true });
type EditValues = z.input<typeof editSchema>;

type BookingEditDialogProps = {
  booking: BookingUIModel | null;
  services: Array<{ id: string; name: string }>;
  isPending: boolean;
  onClose: () => void;
  onSave: (change: AdminBookingUpdate) => void;
};

export function BookingEditDialog({
  booking,
  services,
  isPending,
  onClose,
  onSave,
}: BookingEditDialogProps) {
  return (
    <Dialog open={Boolean(booking)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Boeking bewerken</DialogTitle>
        </DialogHeader>

        {/* The key makes the form start with fresh values for every different booking. */}
        {booking ? (
          <EditForm
            key={booking.id}
            booking={booking}
            services={services}
            isPending={isPending}
            onClose={onClose}
            onSave={onSave}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function EditForm({
  booking,
  services,
  isPending,
  onClose,
  onSave,
}: Omit<BookingEditDialogProps, "booking"> & { booking: BookingUIModel }) {
  const { register, control, handleSubmit, formState } = useForm<EditValues>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      serviceId: booking.serviceId,
      customerName: booking.customerName,
      customerPhone: booking.customerPhone,
      date: booking.date,
      time: booking.time,
      status: booking.status,
      notes: booking.notes ?? "",
    },
  });
  const { errors } = formState;

  const save = handleSubmit((values) =>
    onSave({
      id: booking.id,
      ...values,
      // An empty field means: clear the note.
      notes: values.notes?.trim() ? values.notes : null,
    }),
  );

  return (
    <form onSubmit={save} noValidate className="grid gap-4">
      <Field id="edit-name" label="Klantnaam" error={errors.customerName?.message}>
        <Input id="edit-name" {...register("customerName")} />
      </Field>

      <Field id="edit-phone" label="Telefoonnummer" error={errors.customerPhone?.message}>
        <Input id="edit-phone" type="tel" {...register("customerPhone")} />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field id="edit-service" label="Dienst" error={errors.serviceId?.message}>
          <Controller
            control={control}
            name="serviceId"
            render={({ field }) => (
              <Select value={field.value ?? ""} onValueChange={field.onChange}>
                <SelectTrigger id="edit-service">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </Field>

        <Field id="edit-status" label="Status" error={errors.status?.message}>
          <Controller
            control={control}
            name="status"
            render={({ field }) => (
              <Select value={field.value ?? ""} onValueChange={field.onChange}>
                <SelectTrigger id="edit-status">
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
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field id="edit-date" label="Datum" error={errors.date?.message}>
          <Input id="edit-date" type="date" {...register("date")} />
        </Field>
        <Field id="edit-time" label="Tijd" error={errors.time?.message}>
          <Input id="edit-time" type="time" {...register("time")} />
        </Field>
      </div>

      <Field id="edit-notes" label="Interne notitie" error={errors.notes?.message}>
        <Textarea
          id="edit-notes"
          rows={3}
          placeholder="Alleen zichtbaar voor jou."
          {...register("notes")}
        />
      </Field>

      <p className="text-xs text-muted-foreground">
        Verandert de datum, tijd of dienst? Dan krijgt de klant automatisch een mail met de nieuwe
        gegevens.
      </p>

      <DialogFooter>
        <Button type="button" variant="outline" disabled={isPending} onClick={onClose}>
          Annuleren
        </Button>
        <Button type="submit" className="gap-2" disabled={isPending}>
          {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
          Opslaan
        </Button>
      </DialogFooter>
    </form>
  );
}

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error: string | undefined;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
