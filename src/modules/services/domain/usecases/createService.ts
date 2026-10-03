import type { AdminGuard } from "@/modules/auth/domain/auth.gateway";
import type { ServiceInput } from "../service.schema";
import type { ServiceRepository } from "../service.repository";

/** Beheer: een nieuwe dienst komt onderaan de lijst. */
export async function createService(
  deps: { assertAdmin: AdminGuard; repo: Pick<ServiceRepository, "hoogsteVolgorde" | "create"> },
  input: ServiceInput,
) {
  await deps.assertAdmin();
  const volgorde = (await deps.repo.hoogsteVolgorde()) + 1;
  return deps.repo.create({ ...input, sorteer_volgorde: volgorde });
}
