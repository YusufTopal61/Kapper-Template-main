import { getAdminGuard } from "@/modules/auth/container.server";
import { createSupabaseServiceRepository } from "./data/service.repository.server";

/** Composition root van de services-module. */
export function getServiceDeps() {
  return {
    repo: createSupabaseServiceRepository(),
    assertAdmin: getAdminGuard(),
  };
}
