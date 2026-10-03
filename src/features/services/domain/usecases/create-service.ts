import type { AdminGuard } from "@/features/auth/domain/auth.gateway";
import type { ServiceInput } from "../service.schema";
import type { ServiceRepository } from "../service.repository";

/** Beheer: een nieuwe dienst komt onderaan de lijst. */
export async function createService(
  deps: { assertAdmin: AdminGuard; repo: Pick<ServiceRepository, "highestSortOrder" | "create"> },
  input: ServiceInput,
) {
  await deps.assertAdmin();
  const order = (await deps.repo.highestSortOrder()) + 1;
  return deps.repo.create({ ...input, sortOrder: order });
}
