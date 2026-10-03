import type { AdminGuard } from "@/modules/auth/domain/auth.gateway";
import type { ServiceRepository } from "../service.repository";

/** Beheer: verwijderen mag alleen als er geen boekingen aan hangen; die historie houden we. */
export async function deleteService(
  deps: { assertAdmin: AdminGuard; repo: Pick<ServiceRepository, "remove"> },
  id: string,
) {
  await deps.assertAdmin();
  const uitkomst = await deps.repo.remove(id);

  if (!uitkomst.ok) {
    return {
      ok: false as const,
      error:
        "Deze dienst is aan bestaande boekingen gekoppeld en kan niet verwijderd worden. Zet hem op inactief om hem uit het aanbod te halen.",
    };
  }
  return { ok: true as const };
}
