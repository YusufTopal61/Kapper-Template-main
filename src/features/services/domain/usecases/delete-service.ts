import type { AdminGuard } from "@/features/auth/domain/auth.gateway";
import type { ServiceRepository } from "../service.repository";

/** Admin: deleting is only allowed when no bookings reference it; we keep that history. */
export async function deleteService(
  deps: { assertAdmin: AdminGuard; repo: Pick<ServiceRepository, "remove"> },
  id: string,
) {
  await deps.assertAdmin();
  const outcome = await deps.repo.remove(id);

  if (!outcome.ok) {
    return {
      ok: false as const,
      error:
        "Deze dienst is aan bestaande boekingen gekoppeld en kan niet verwijderd worden. Zet hem op inactief om hem uit het aanbod te halen.",
    };
  }
  return { ok: true as const };
}
