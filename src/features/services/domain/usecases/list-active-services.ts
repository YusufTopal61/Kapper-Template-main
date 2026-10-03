import type { ServiceRepository } from "../service.repository";

/** Publiek: een storing mag de site niet breken, dan tonen we gewoon geen diensten. */
export async function listActiveServices(repo: Pick<ServiceRepository, "listActive">) {
  try {
    return await repo.listActive();
  } catch (error) {
    console.error("[services] actieve diensten ophalen mislukt:", error);
    return [];
  }
}
