import "server-only";
import { isSupabaseConfigured } from "@/lib/env";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { AuthGateway } from "../domain/auth.gateway";

/** Fails closed: a query error counts as "not an admin". */
async function isRegisteredAdmin(userId: string) {
  const supabase = await getSupabaseServerClient();
  const { data } = await supabase
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
        return { signedIn: false, email: null, notAdmin: false, supabaseConfigured: false };
      }

      const supabase = await getSupabaseServerClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return { signedIn: false, email: null, notAdmin: false, supabaseConfigured: true };
      }

      const isAdmin = await isRegisteredAdmin(user.id);
      return {
        signedIn: isAdmin,
        email: user.email ?? null,
        notAdmin: !isAdmin,
        supabaseConfigured: true,
      };
    },

    async signIn(email, password) {
      const supabase = await getSupabaseServerClient();
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error || !data.user) return { status: "invalid-credentials" };

      if (!(await isRegisteredAdmin(data.user.id))) {
        // A valid account, but not an admin: revoke the session right away.
        await supabase.auth.signOut();
        return { status: "not-admin" };
      }

      return { status: "ok", email: data.user.email ?? email };
    },

    async signOut() {
      const supabase = await getSupabaseServerClient();
      await supabase.auth.signOut();
    },

    async getAdminStatus() {
      const supabase = await getSupabaseServerClient();
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) return "signed-out";
      return (await isRegisteredAdmin(user.id)) ? "admin" : "not-admin";
    },
  };
}
