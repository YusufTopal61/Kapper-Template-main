import "server-only";
import {
  getSupabaseAdminClient,
  getSupabaseServerClient,
} from "@/shared/lib/supabase/supabase.server";
import type { ServiceRepository } from "../domain/service.repository";
import { naarService } from "./service.mapper";

/** Postgres: foreign key violation — er hangen nog boekingen aan. */
const FK_VIOLATION = "23503";

export function createSupabaseServiceRepository(): ServiceRepository {
  return {
    async listActive() {
      const { data, error } = await (
        await getSupabaseServerClient()
      )
        .from("services")
        .select("*")
        .eq("actief", true)
        .order("sorteer_volgorde", { ascending: true })
        .order("created_at", { ascending: true });

      if (error) throw error;
      return (data ?? []).map(naarService);
    },

    async listAll() {
      const { data, error } = await (
        await getSupabaseServerClient()
      )
        .from("services")
        .select("*")
        .order("sorteer_volgorde", { ascending: true })
        .order("created_at", { ascending: true });

      if (error) throw error;
      return (data ?? []).map(naarService);
    },

    async findById(id) {
      const { data, error } = await getSupabaseAdminClient()
        .from("services")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      return data ? naarService(data) : null;
    },

    async hoogsteVolgorde() {
      const { data } = await (
        await getSupabaseServerClient()
      )
        .from("services")
        .select("sorteer_volgorde")
        .order("sorteer_volgorde", { ascending: false })
        .limit(1)
        .maybeSingle();

      return data?.sorteer_volgorde ?? 0;
    },

    async create(input) {
      const { data, error } = await (
        await getSupabaseServerClient()
      )
        .from("services")
        .insert({
          naam: input.naam,
          beschrijving: input.beschrijving,
          prijs: input.prijs,
          duur_minuten: input.duur_minuten,
          actief: input.actief,
          sorteer_volgorde: input.sorteer_volgorde,
        })
        .select()
        .single();

      if (error) throw error;
      return naarService(data);
    },

    async update(patch) {
      const { id, ...velden } = patch;
      const { data, error } = await (
        await getSupabaseServerClient()
      )
        .from("services")
        .update(velden)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return naarService(data);
    },

    async remove(id) {
      const supabase = await getSupabaseServerClient();
      const { error } = await supabase.from("services").delete().eq("id", id);

      if (error) {
        if (error.code === FK_VIOLATION) return { ok: false, reden: "in-gebruik" };
        throw error;
      }
      return { ok: true };
    },
  };
}
