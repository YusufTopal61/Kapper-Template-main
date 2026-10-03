"use server";

import { getAuthGateway } from "@/lib/di/container";
import { invalidInput, runAction } from "@/lib/utils/action-result";
import { limitRequests } from "@/lib/utils/request-limit.server";
import { loginSchema } from "../domain/auth.schema";
import { signIn, type SignInResult } from "../domain/usecases/sign-in";

const LOGIN_WINDOW_MS = 15 * 60 * 1000;

export async function signInAction(input: unknown): Promise<SignInResult> {
  const valid = loginSchema.safeParse(input);
  if (!valid.success) return invalidInput(valid.error);

  const waitSeconds = await limitRequests("login", 5, LOGIN_WINDOW_MS);
  if (waitSeconds !== null) {
    return {
      ok: false,
      error: `Te veel inlogpogingen. Probeer het over ${waitSeconds} seconden opnieuw.`,
    };
  }

  return runAction(() => signIn(getAuthGateway(), valid.data));
}

export async function signOutAction() {
  return runAction(async () => {
    await getAuthGateway().signOut();
    return { ok: true as const };
  });
}
