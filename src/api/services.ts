import { createServerFn } from "@tanstack/react-start";
import { getSupabaseServerClient } from "@/lib/supabase/supabase.server";
import { serviceIdSchema, serviceInputSchema, serviceUpdateSchema } from "@/lib/validation";
import type { Service } from "@/lib/supabase/types";
import { requireAdmin } from "./common.server";

/** Actieve diensten voor de publieke site en de boekingsflow. */
export const fetchActiveServices = createServerFn({ method: "GET" }).handler(
  async (): Promise<Service[]> => {
    try {
      const supabase = getSupabaseServerClient();
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("actief", true)
        .order("sorteer_volgorde", { ascending: true })
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data ?? [];
    } catch (error) {
      console.error("[services] actieve diensten ophalen mislukt:", error);
      return [];
    }
  },
);

export const fetchAllServices = createServerFn({ method: "GET" }).handler(
  async (): Promise<Service[]> => {
    const { supabase } = await requireAdmin();

    const { data, error } = await supabase
      .from("services")
      .select("*")
      .order("sorteer_volgorde", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) throw error;
    return data ?? [];
  },
);

export const createService = createServerFn({ method: "POST" })
  .inputValidator(serviceInputSchema)
  .handler(async ({ data }) => {
    const { supabase } = await requireAdmin();

    // Nieuwe dienst onderaan de lijst.
    const { data: laatste } = await supabase
      .from("services")
      .select("sorteer_volgorde")
      .order("sorteer_volgorde", { ascending: false })
      .limit(1)
      .maybeSingle();

    const { data: nieuw, error } = await supabase
      .from("services")
      .insert({
        naam: data.naam,
        beschrijving: data.beschrijving,
        prijs: data.prijs,
        duur_minuten: data.duur_minuten,
        actief: data.actief,
        sorteer_volgorde: (laatste?.sorteer_volgorde ?? 0) + 1,
      })
      .select()
      .single();

    if (error) throw error;
    return nieuw;
  });

export const updateService = createServerFn({ method: "POST" })
  .inputValidator(serviceUpdateSchema)
  .handler(async ({ data }) => {
    const { supabase } = await requireAdmin();
    const { id, ...velden } = data;

    const { data: bijgewerkt, error } = await supabase
      .from("services")
      .update(velden)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return bijgewerkt;
  });

export const deleteService = createServerFn({ method: "POST" })
  .inputValidator(serviceIdSchema)
  .handler(async ({ data }) => {
    const { supabase } = await requireAdmin();

    const { error } = await supabase.from("services").delete().eq("id", data.id);

    if (error) {
      // 23503 = foreign key violation: er hangen nog boekingen aan deze dienst.
      // Die historie willen we niet stilletjes weggooien.
      if (error.code === "23503") {
        return {
          ok: false as const,
          error:
            "Deze dienst is aan bestaande boekingen gekoppeld en kan niet verwijderd worden. Zet hem op inactief om hem uit het aanbod te halen.",
        };
      }
      throw error;
    }

    return { ok: true as const };
  });
