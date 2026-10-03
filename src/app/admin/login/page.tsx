import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAuthGateway } from "@/lib/di/container";
import { getSession } from "@/features/auth/domain/usecases/get-session";
import { LoginForm } from "@/features/auth/presentation/LoginForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Inloggen" };

export default async function LoginPage() {
  const session = await getSession(getAuthGateway());

  // Al ingelogd? Dan is de loginpagina overbodig.
  if (session.signedIn) redirect("/admin");

  // Ook zonder Supabase-configuratie renderen we hier: het formulier legt dan uit wat er nog mist.
  return <LoginForm supabaseConfigured={session.supabaseConfigured} />;
}
