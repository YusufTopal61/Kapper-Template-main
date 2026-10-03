import type { AdminGuard } from "@/features/auth/domain/auth.gateway";
import type { ServiceUpdate } from "../service.schema";
import type { ServiceRepository } from "../service.repository";

/** Beheer: een dienst wijzigen (ook activeren of deactiveren). */
export async function updateService(
  deps: { assertAdmin: AdminGuard; repo: Pick<ServiceRepository, "update"> },
  patch: ServiceUpdate,
) {
  await deps.assertAdmin();
  return deps.repo.update(patch);
}
