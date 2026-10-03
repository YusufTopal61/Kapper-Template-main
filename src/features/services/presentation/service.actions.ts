"use server";

import { getServiceDeps } from "@/lib/di/container";
import { invalidInput, runAction } from "@/lib/utils/action-result";
import { serviceIdSchema, serviceInputSchema, serviceUpdateSchema } from "../domain/service.schema";
import { createService } from "../domain/usecases/create-service";
import { deleteService } from "../domain/usecases/delete-service";
import { updateService } from "../domain/usecases/update-service";

export async function createServiceAction(input: unknown) {
  const valid = serviceInputSchema.safeParse(input);
  if (!valid.success) return invalidInput(valid.error);

  return runAction(async () => ({
    ok: true as const,
    service: await createService(getServiceDeps(), valid.data),
  }));
}

export async function updateServiceAction(input: unknown) {
  const valid = serviceUpdateSchema.safeParse(input);
  if (!valid.success) return invalidInput(valid.error);

  return runAction(async () => ({
    ok: true as const,
    service: await updateService(getServiceDeps(), valid.data),
  }));
}

export async function deleteServiceAction(input: unknown) {
  const valid = serviceIdSchema.safeParse(input);
  if (!valid.success) return invalidInput(valid.error);

  return runAction(() => deleteService(getServiceDeps(), valid.data.id));
}
