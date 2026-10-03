import "server-only";
import { DatabaseError } from "@/lib/errors";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { SettingsRepository } from "../domain/settings.repository";
import { toBusinessSettings, toSettingsUpdate } from "./settings.mapper";

export function createSupabaseSettingsRepository(): SettingsRepository {
  return {
    async read() {
      // admin_settings deliberately has no public read access (admin_email is
      // private), so server-internal reads go through the service role.
      const { data, error } = await getSupabaseAdminClient()
        .from("admin_settings")
        .select("*")
        .eq("singleton", true)
        .maybeSingle();

      if (error) throw new DatabaseError("settings.read", error);
      return data ? toBusinessSettings(data) : null;
    },

    async readAsAdmin() {
      const supabase = await getSupabaseServerClient();
      const { data, error } = await supabase
        .from("admin_settings")
        .select("*")
        .eq("singleton", true)
        .maybeSingle();

      if (error) throw new DatabaseError("settings.readAsAdmin", error);
      return data ? toBusinessSettings(data) : null;
    },

    async save(input) {
      const supabase = await getSupabaseServerClient();
      const { error } = await supabase
        .from("admin_settings")
        .update(toSettingsUpdate(input))
        .eq("singleton", true);

      if (error) throw new DatabaseError("settings.save", error);
    },
  };
}
