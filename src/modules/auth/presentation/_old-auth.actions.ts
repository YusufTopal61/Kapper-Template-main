import { createServerFn } from "@tanstack/react-start";
import { getClientIp } from "@/shared/lib/client-ip.server";
import { rateLimit } from "@/shared/lib/rate-limit";
import { loginSchema } from "../domain/auth.schema";
import { getAuthGateway } from "../container.server";
import { signInUseCase, type SignInResultaat } from "./sign-in";

export const fetchSession = createServerFn({ method: "GET" }).handler(() =>
  getAuthGateway().getSession(),
);

export const signIn = createServerFn({ method: "POST" })
  .inputValidator(loginSchema)
  .handler(async ({ data }): Promise<SignInResultaat> => {
    const limiet = rateLimit(`login:${getClientIp()}`, { max: 5, vensterMs: 15 * 60 * 1000 });

    if (!limiet.toegestaan) {
      return {
        ok: false,
        error: `Te veel inlogpogingen. Probeer het over ${limiet.opnieuwProberenOverSeconden} seconden opnieuw.`,
      };
    }

    return signInUseCase(getAuthGateway(), data);
  });

export const signOut = createServerFn({ method: "POST" }).handler(async () => {
  await getAuthGateway().signOut();
  return { ok: true as const };
});
