import "server-only";
import {
  getSupabaseAdminClient,
  getSupabaseServerClient,
} from "@/shared/lib/supabase/supabase.server";
import type { SettingsRepository } from "../domain/settings.repository";
import { naarBusinessSettings } from "./settings.mapper";

export function createSupabaseSettingsRepository(): SettingsRepository {
  return {
    async read() {
      // admin_settings heeft bewust geen publieke leesrechten (admin_email is
      // privé), dus server-intern lezen gaat met de service role.
      const { data, error } = await getSupabaseAdminClient()
        .from("admin_settings")
        .select("*")
        .eq("singleton", true)
        .maybeSingle();

      if (error) throw error;
      return data ? naarBusinessSettings(data) : null;
    },

    async readAsAdmin() {
      const { data, error } = await (
        await getSupabaseServerClient()
      )
        .from("admin_settings")
        .select("*")
        .eq("singleton", true)
        .maybeSingle();

      if (error) throw error;
      return data ? naarBusinessSettings(data) : null;
    },

    async save(input) {
      const { error } = await (
        await getSupabaseServerClient()
      )
        .from("admin_settings")
        .update({
          bedrijfsnaam: input.bedrijfsnaam,
          admin_email: input.admin_email,
          telefoonnummer: input.telefoonnummer,
          adres: input.adres,
          openingstijden: input.openingstijden,
        })
        .eq("singleton", true);

      if (error) throw error;
    },
  };
}
