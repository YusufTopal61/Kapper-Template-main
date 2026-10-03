import type { AdminGuard } from "@/modules/auth/domain/auth.gateway";
import type { ServiceRepository } from "../domain/service.repository";
import type { ServiceInput, ServiceUpdate } from "../domain/service.schema";

type Admin = { assertAdmin: AdminGuard };

/** Publiek: een storing mag de site niet breken, dan tonen we gewoon geen diensten. */
export async function listActiveServices(repo: Pick<ServiceRepository, "listActive">) {
  try {
    return await repo.listActive();
  } catch (error) {
    console.error("[services] actieve diensten ophalen mislukt:", error);
    return [];
  }
}

export async function listAllServices(deps: Admin & { repo: Pick<ServiceRepository, "listAll"> }) {
  await deps.assertAdmin();
  return deps.repo.listAll();
}

export async function createService(
  deps: Admin & { repo: Pick<ServiceRepository, "hoogsteVolgorde" | "create"> },
  input: ServiceInput,
) {
  await deps.assertAdmin();
  // Een nieuwe dienst komt onderaan de lijst.
  const volgorde = (await deps.repo.hoogsteVolgorde()) + 1;
  return deps.repo.create({ ...input, sorteer_volgorde: volgorde });
}

export async function updateService(
  deps: Admin & { repo: Pick<ServiceRepository, "update"> },
  patch: ServiceUpdate,
) {
  await deps.assertAdmin();
  return deps.repo.update(patch);
}

export async function deleteService(
  deps: Admin & { repo: Pick<ServiceRepository, "remove"> },
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
