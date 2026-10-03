"use server";

import { getServiceDeps } from "@/app/di/container";
import { ongeldigeInvoer } from "@/shared/lib/action-result";
import { uitvoerenAlsBeheerder } from "@/modules/auth/presentation/admin-action";
import { serviceIdSchema, serviceInputSchema, serviceUpdateSchema } from "../domain/service.schema";
import { createService } from "../domain/usecases/createService";
import { deleteService } from "../domain/usecases/deleteService";
import { updateService } from "../domain/usecases/updateService";

export async function createServiceAction(input: unknown) {
  const geldig = serviceInputSchema.safeParse(input);
  if (!geldig.success) return ongeldigeInvoer(geldig.error);

  return uitvoerenAlsBeheerder(async () => ({
    ok: true as const,
    dienst: await createService(getServiceDeps(), geldig.data),
  }));
}

export async function updateServiceAction(input: unknown) {
  const geldig = serviceUpdateSchema.safeParse(input);
  if (!geldig.success) return ongeldigeInvoer(geldig.error);

  return uitvoerenAlsBeheerder(async () => ({
    ok: true as const,
    dienst: await updateService(getServiceDeps(), geldig.data),
  }));
}

export async function deleteServiceAction(input: unknown) {
  const geldig = serviceIdSchema.safeParse(input);
  if (!geldig.success) return ongeldigeInvoer(geldig.error);

  return uitvoerenAlsBeheerder(() => deleteService(getServiceDeps(), geldig.data.id));
}
