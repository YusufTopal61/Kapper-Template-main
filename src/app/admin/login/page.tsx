import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAuthGateway } from "@/lib/di/container";
import { getSession } from "@/features/auth/domain/usecases/get-session";
import { LoginForm } from "@/features/auth/presentation/LoginForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Inloggen" };

export default async function LoginPage() {
  const session = await getSession(getAuthGateway());

  // Already signed in? Then the login page is redundant.
  if (session.signedIn) redirect("/admin");

  // We render here even without Supabase configuration: the form then explains what is still missing.
  return <LoginForm supabaseConfigured={session.supabaseConfigured} />;
}
