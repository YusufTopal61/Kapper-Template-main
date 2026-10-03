"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type FieldErrors } from "react-hook-form";
import type { z } from "zod";
import type { AdminInstellingen } from "../domain/settings.entity";
import { settingsInputSchema, type SettingsInput } from "../domain/settings.schema";
import { saveSettingsAction } from "./settings.actions";

export type SettingsFormWaarden = z.input<typeof settingsInputSchema>;

/** Zoekt de eerste leesbare foutmelding in een (mogelijk geneste) foutboom. */
function eersteFoutmelding(fouten: FieldErrors): string | null {
  for (const fout of Object.values(fouten)) {
    if (!fout || typeof fout !== "object") continue;
    if ("message" in fout && typeof fout.message === "string" && fout.message) return fout.message;
    const dieper = eersteFoutmelding(fout as FieldErrors);
    if (dieper) return dieper;
  }
  return null;
}

/** View model van het instellingenscherm: formulierstaat, opslaan en bevestiging tonen. */
export function useSettingsForm(instellingen: AdminInstellingen) {
  const router = useRouter();
  const [fout, setFout] = useState<string | null>(null);
  const [opgeslagen, setOpgeslagen] = useState(false);
  const [bezig, startTransition] = useTransition();

  const form = useForm<SettingsFormWaarden, unknown, SettingsInput>({
    resolver: zodResolver(settingsInputSchema),
    defaultValues: {
      bedrijfsnaam: instellingen.bedrijfsnaam,
      admin_email: instellingen.admin_email ?? "",
      telefoonnummer: instellingen.telefoonnummer ?? "",
      adres: instellingen.adres ?? "",
      openingstijden: instellingen.openingstijden,
    },
  });

  useEffect(() => {
    if (!opgeslagen) return;
    const timer = setTimeout(() => setOpgeslagen(false), 3000);
    return () => clearTimeout(timer);
  }, [opgeslagen]);

  const verstuur = form.handleSubmit(
    (waarden) => {
      setFout(null);
      startTransition(async () => {
        try {
          const uitkomst = await saveSettingsAction(waarden);
          if (!uitkomst.ok) {
            setFout(uitkomst.error);
            return;
          }
          setOpgeslagen(true);
          router.refresh();
        } catch {
          setFout("Opslaan mislukte. Probeer het zo nog eens.");
        }
      });
    },
    (fouten) => setFout(eersteFoutmelding(fouten) ?? "Controleer de ingevulde gegevens."),
  );

  return {
    form,
    fout,
    opgeslagen,
    bezig,
    verstuur,
    wisFout: () => setFout(null),
  };
}
