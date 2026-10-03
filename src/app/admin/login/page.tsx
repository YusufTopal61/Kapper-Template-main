import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAuthGateway } from "@/app/di/container";
import { getSession } from "@/modules/auth/domain/usecases/getSession";
import { LoginForm } from "@/modules/auth/presentation/LoginForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Inloggen" };

export default async function LoginPagina() {
  const sessie = await getSession(getAuthGateway());

  // Al ingelogd? Dan is de loginpagina overbodig.
  if (sessie.ingelogd) redirect("/admin");

  // Ook zonder Supabase-configuratie renderen we hier: het formulier legt dan uit wat er nog mist.
  return <LoginForm supabaseGeconfigureerd={sessie.supabaseGeconfigureerd} />;
}
