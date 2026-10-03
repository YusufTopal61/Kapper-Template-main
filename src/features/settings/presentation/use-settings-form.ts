"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type FieldErrors } from "react-hook-form";
import type { z } from "zod";
import type { AdminSettings } from "../domain/settings.entity";
import { settingsInputSchema, type SettingsInput } from "../domain/settings.schema";
import { saveSettingsAction } from "./settings.actions";

export type SettingsFormValues = z.input<typeof settingsInputSchema>;

/** Zoekt de eerste leesbare foutmelding in een (mogelijk geneste) foutboom. */
function firstErrorMessage(errors: FieldErrors): string | null {
  for (const error of Object.values(errors)) {
    if (!error || typeof error !== "object") continue;
    if ("message" in error && typeof error.message === "string" && error.message)
      return error.message;
    const deeper = firstErrorMessage(error as FieldErrors);
    if (deeper) return deeper;
  }
  return null;
}

/** View model van het instellingenscherm: formulierstaat, opslaan en bevestiging tonen. */
export function useSettingsForm(settings: AdminSettings) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<SettingsFormValues, unknown, SettingsInput>({
    resolver: zodResolver(settingsInputSchema),
    defaultValues: {
      businessName: settings.businessName,
      adminEmail: settings.adminEmail ?? "",
      phoneNumber: settings.phoneNumber ?? "",
      address: settings.address ?? "",
      openingHours: settings.openingHours,
    },
  });

  useEffect(() => {
    if (!saved) return;
    const timer = setTimeout(() => setSaved(false), 3000);
    return () => clearTimeout(timer);
  }, [saved]);

  const submit = form.handleSubmit(
    (values) => {
      setError(null);
      startTransition(async () => {
        try {
          const outcome = await saveSettingsAction(values);
          if (!outcome.ok) {
            setError(outcome.error);
            return;
          }
          setSaved(true);
          router.refresh();
        } catch {
          setError("Opslaan mislukte. Probeer het zo nog eens.");
        }
      });
    },
    (errors) => setError(firstErrorMessage(errors) ?? "Controleer de ingevulde gegevens."),
  );

  return {
    form,
    error,
    saved,
    isPending,
    submit,
    clearError: () => setError(null),
  };
}
