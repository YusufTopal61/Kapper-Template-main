import { createServerFn } from "@tanstack/react-start";
import { settingsInputSchema } from "@/lib/validation";
import { DEFAULT_OPENINGSTIJDEN } from "@/lib/opening-hours";
import type { Openingstijden } from "@/lib/supabase/types";
import { leesInstellingen, requireAdmin } from "./common.server";

export type PubliekeInstellingen = {
  bedrijfsnaam: string;
  adres: string | null;
  telefoonnummer: string | null;
  openingstijden: Openingstijden;
};

const FALLBACK: PubliekeInstellingen = {
  bedrijfsnaam: "Barber",
  adres: null,
  telefoonnummer: null,
  openingstijden: DEFAULT_OPENINGSTIJDEN,
};

/**
 * Instellingen voor publieke pagina's. Bewust zonder admin_email — dat adres
 * hoort niet in de browser terecht te komen.
 */
export const fetchPublicSettings = createServerFn({ method: "GET" }).handler(
  async (): Promise<PubliekeInstellingen> => {
    try {
      const instellingen = await leesInstellingen();
      if (!instellingen) return FALLBACK;

      return {
        bedrijfsnaam: instellingen.bedrijfsnaam,
        adres: instellingen.adres,
        telefoonnummer: instellingen.telefoonnummer,
        openingstijden: instellingen.openingstijden ?? DEFAULT_OPENINGSTIJDEN,
      };
    } catch (error) {
      // De publieke site moet ook overeind blijven als Supabase nog niet
      // geconfigureerd is of even onbereikbaar is.
      console.error("[settings] publieke instellingen ophalen mislukt:", error);
      return FALLBACK;
    }
  },
);

export const fetchAdminSettings = createServerFn({ method: "GET" }).handler(async () => {
  const { supabase } = await requireAdmin();

  const { data, error } = await supabase
    .from("admin_settings")
    .select("*")
    .eq("singleton", true)
    .maybeSingle();

  if (error) throw error;

  return {
    id: data?.id ?? null,
    bedrijfsnaam: data?.bedrijfsnaam ?? "Barber",
    admin_email: data?.admin_email ?? null,
    telefoonnummer: data?.telefoonnummer ?? null,
    adres: data?.adres ?? null,
    openingstijden: data?.openingstijden ?? DEFAULT_OPENINGSTIJDEN,
    // Stuurt de UI aan die vraagt om een notificatie-adres in te vullen.
    emailIngesteld: Boolean(data?.admin_email),
  };
});

export const saveAdminSettings = createServerFn({ method: "POST" })
  .inputValidator(settingsInputSchema)
  .handler(async ({ data }) => {
    const { supabase } = await requireAdmin();

    const { error } = await supabase
      .from("admin_settings")
      .update({
        bedrijfsnaam: data.bedrijfsnaam,
        admin_email: data.admin_email,
        telefoonnummer: data.telefoonnummer,
        adres: data.adres,
        openingstijden: data.openingstijden,
      })
      .eq("singleton", true);

    if (error) throw error;

    return { ok: true as const };
  });
