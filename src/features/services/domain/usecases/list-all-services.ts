import type { AdminGuard } from "@/features/auth/domain/auth.gateway";
import type { ServiceRepository } from "../service.repository";

/** Admin: all services, including the inactive ones. */
export async function listAllServices(deps: {
  assertAdmin: AdminGuard;
  repo: Pick<ServiceRepository, "listAll">;
}) {
  await deps.assertAdmin();
  return deps.repo.listAll();
}
