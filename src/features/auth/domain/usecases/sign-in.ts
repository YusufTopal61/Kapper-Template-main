import type { AuthGateway } from "../auth.gateway";
import type { LoginInput } from "../auth.schema";

export type SignInResult = { ok: true; email: string } | { ok: false; error: string };

export async function signIn(
  auth: Pick<AuthGateway, "signIn">,
  input: LoginInput,
): Promise<SignInResult> {
  const outcome = await auth.signIn(input.email, input.password);

  switch (outcome.status) {
    case "ok":
      return { ok: true, email: outcome.email };
    case "not-admin":
      return { ok: false, error: "Dit account heeft geen beheerrechten voor deze zaak." };
    case "invalid-credentials":
      // Bewust vaag: verklapt niet of het e-mailadres bestaat.
      return { ok: false, error: "E-mailadres of wachtwoord klopt niet." };
  }
}
