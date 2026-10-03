"use server";

import { getAuthGateway } from "@/app/di/container";
import { ongeldigeInvoer } from "@/shared/lib/action-result";
import { beperkAanvragen } from "@/shared/lib/request-limit.server";
import { loginSchema } from "../domain/auth.schema";
import { signIn, type SignInResultaat } from "../domain/usecases/signIn";

const LOGIN_VENSTER_MS = 15 * 60 * 1000;

export async function signInAction(input: unknown): Promise<SignInResultaat> {
  const geldig = loginSchema.safeParse(input);
  if (!geldig.success) return ongeldigeInvoer(geldig.error);

  const wacht = await beperkAanvragen("login", 5, LOGIN_VENSTER_MS);
  if (wacht !== null) {
    return {
      ok: false,
      error: `Te veel inlogpogingen. Probeer het over ${wacht} seconden opnieuw.`,
    };
  }

  return signIn(getAuthGateway(), geldig.data);
}

export async function signOutAction() {
  await getAuthGateway().signOut();
  return { ok: true as const };
}
