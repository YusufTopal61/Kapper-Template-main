import "server-only";
import { isSupabaseConfigured } from "@/shared/lib/env";
import { getSupabaseServerClient } from "@/shared/lib/supabase/supabase.server";
import type { AuthGateway } from "../domain/auth.gateway";

async function isBeheerder(userId: string) {
  const { data } = await (
    await getSupabaseServerClient()
  )
    .from("admin_users")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();
  return Boolean(data);
}

export function createSupabaseAuthGateway(): AuthGateway {
  return {
    async getSession() {
      if (!isSupabaseConfigured) {
        return {
          ingelogd: false,
          email: null,
          geenBeheerder: false,
          supabaseGeconfigureerd: false,
        };
      }

      const {
        data: { user },
      } = await (await getSupabaseServerClient()).auth.getUser();

      if (!user) {
        return { ingelogd: false, email: null, geenBeheerder: false, supabaseGeconfigureerd: true };
      }

      const beheerder = await isBeheerder(user.id);
      return {
        ingelogd: beheerder,
        email: user.email ?? null,
        geenBeheerder: !beheerder,
        supabaseGeconfigureerd: true,
      };
    },

    async signIn(email, password) {
      const supabase = await getSupabaseServerClient();
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error || !data.user) return { status: "ongeldige-gegevens" };

      if (!(await isBeheerder(data.user.id))) {
        // Wel een geldig account, maar geen beheerder: sessie meteen weer intrekken.
        await supabase.auth.signOut();
        return { status: "geen-beheerder" };
      }

      return { status: "ok", email: data.user.email ?? email };
    },

    async signOut() {
      await (await getSupabaseServerClient()).auth.signOut();
    },

    async isAdmin() {
      const {
        data: { user },
        error,
      } = await (await getSupabaseServerClient()).auth.getUser();

      if (error || !user) return false;
      return isBeheerder(user.id);
    },
  };
}
