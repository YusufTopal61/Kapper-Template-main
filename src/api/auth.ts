import { createServerFn } from "@tanstack/react-start";
import { getRequestIP } from "@tanstack/react-start/server";
import { getSupabaseServerClient } from "@/lib/supabase/supabase.server";
import { isSupabaseConfigured } from "@/lib/env";
import { loginSchema } from "@/lib/validation";
import { rateLimit } from "@/lib/rate-limit";

export type SessieStatus = {
  ingelogd: boolean;
  email: string | null;
  /** Ingelogd, maar niet als beheerder aangemerkt in admin_users. */
  geenBeheerder: boolean;
  supabaseGeconfigureerd: boolean;
};

export const fetchSession = createServerFn({ method: "GET" }).handler(
  async (): Promise<SessieStatus> => {
    if (!isSupabaseConfigured) {
      return {
        ingelogd: false,
        email: null,
        geenBeheerder: false,
        supabaseGeconfigureerd: false,
      };
    }

    const supabase = getSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { ingelogd: false, email: null, geenBeheerder: false, supabaseGeconfigureerd: true };
    }

    const { data: beheerder } = await supabase
      .from("admin_users")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();

    return {
      ingelogd: Boolean(beheerder),
      email: user.email ?? null,
      geenBeheerder: !beheerder,
      supabaseGeconfigureerd: true,
    };
  },
);

export const signIn = createServerFn({ method: "POST" })
  .inputValidator(loginSchema)
  .handler(
    async ({ data }): Promise<{ ok: true; email: string } | { ok: false; error: string }> => {
      const ip = getRequestIP({ xForwardedFor: true }) ?? "onbekend";
      const limiet = rateLimit(`login:${ip}`, { max: 10, vensterMs: 15 * 60 * 1000 });

      if (!limiet.toegestaan) {
        return {
          ok: false,
          error: `Te veel inlogpogingen. Probeer het over ${limiet.opnieuwProberenOverSeconden} seconden opnieuw.`,
        };
      }

      const supabase = getSupabaseServerClient();

      const { data: sessie, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error || !sessie.user) {
        // Bewust vaag: verklapt niet of het e-mailadres bestaat.
        return { ok: false, error: "E-mailadres of wachtwoord klopt niet." };
      }

      const { data: beheerder } = await supabase
        .from("admin_users")
        .select("user_id")
        .eq("user_id", sessie.user.id)
        .maybeSingle();

      if (!beheerder) {
        // Wel een geldig account, maar geen beheerder: sessie meteen weer intrekken.
        await supabase.auth.signOut();
        return {
          ok: false,
          error: "Dit account heeft geen beheerrechten voor deze zaak.",
        };
      }

      return { ok: true, email: sessie.user.email ?? data.email };
    },
  );

export const signOut = createServerFn({ method: "POST" }).handler(async () => {
  const supabase = getSupabaseServerClient();
  await supabase.auth.signOut();
  return { ok: true as const };
});
