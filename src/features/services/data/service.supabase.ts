import "server-only";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { ServiceRepository } from "../domain/service.repository";
import { toService, toServiceInsert, toServiceUpdate } from "./service.mapper";

/** Postgres: foreign key violation — bookings still reference this service. */
const FK_VIOLATION = "23503";

export function createSupabaseServiceRepository(): ServiceRepository {
  return {
    async listActive() {
      const supabase = await getSupabaseServerClient();
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data.map(toService);
    },

    async listAll() {
      const supabase = await getSupabaseServerClient();
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data.map(toService);
    },

    async findById(id) {
      const { data, error } = await getSupabaseAdminClient()
        .from("services")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      return data ? toService(data) : null;
    },

    async highestSortOrder() {
      const supabase = await getSupabaseServerClient();
      const { data, error } = await supabase
        .from("services")
        .select("sort_order")
        .order("sort_order", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data?.sort_order ?? 0;
    },

    async create(input) {
      const supabase = await getSupabaseServerClient();
      const { data, error } = await supabase
        .from("services")
        .insert(toServiceInsert(input))
        .select()
        .single();

      if (error) throw error;
      return toService(data);
    },

    async update(patch) {
      const { id, ...fields } = patch;
      const supabase = await getSupabaseServerClient();
      const { data, error } = await supabase
        .from("services")
        .update(toServiceUpdate(fields))
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return toService(data);
    },

    async remove(id) {
      const supabase = await getSupabaseServerClient();
      const { error } = await supabase.from("services").delete().eq("id", id);

      if (error) {
        if (error.code === FK_VIOLATION) return { ok: false, reason: "in-use" };
        throw error;
      }
      return { ok: true };
    },
  };
}
