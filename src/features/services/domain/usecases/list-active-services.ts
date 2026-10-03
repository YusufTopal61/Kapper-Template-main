import { logger } from "@/lib/logger";
import type { ServiceRepository } from "../service.repository";

/** Public: an outage must not break the site, so we simply show no services. */
export async function listActiveServices(repo: Pick<ServiceRepository, "listActive">) {
  try {
    return await repo.listActive();
  } catch (error) {
    logger.error("services", "fetching active services failed, showing none", error);
    return [];
  }
}
