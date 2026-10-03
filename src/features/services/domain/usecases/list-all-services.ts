import type { AdminGuard } from "@/features/auth/domain/auth.gateway";
import type { ServiceRepository } from "../service.repository";

/** Beheer: alle diensten, ook de inactieve. */
export async function listAllServices(deps: {
  assertAdmin: AdminGuard;
  repo: Pick<ServiceRepository, "listAll">;
}) {
  await deps.assertAdmin();
  return deps.repo.listAll();
}
