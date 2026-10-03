import type { AuthGateway } from "../auth.gateway";
import type { LoginInput } from "../auth.schema";

export type SignInResultaat = { ok: true; email: string } | { ok: false; error: string };

export async function signIn(
  auth: Pick<AuthGateway, "signIn">,
  input: LoginInput,
): Promise<SignInResultaat> {
  const uitkomst = await auth.signIn(input.email, input.password);

  switch (uitkomst.status) {
    case "ok":
      return { ok: true, email: uitkomst.email };
    case "geen-beheerder":
      return { ok: false, error: "Dit account heeft geen beheerrechten voor deze zaak." };
    case "ongeldige-gegevens":
      // Bewust vaag: verklapt niet of het e-mailadres bestaat.
      return { ok: false, error: "E-mailadres of wachtwoord klopt niet." };
  }
}
