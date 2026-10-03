import { createServerFn } from "@tanstack/react-start";
import {
  serviceIdSchema,
  serviceInputSchema,
  serviceUpdateSchema,
} from "../domain/service.schema";
import { getServiceDeps } from "../container.server";
import * as services from "./services.usecases";

export const fetchActiveServices = createServerFn({ method: "GET" }).handler(() =>
  services.listActiveServices(getServiceDeps().repo),
);

export const fetchAllServices = createServerFn({ method: "GET" }).handler(() =>
  services.listAllServices(getServiceDeps()),
);

export const createService = createServerFn({ method: "POST" })
  .inputValidator(serviceInputSchema)
  .handler(({ data }) => services.createService(getServiceDeps(), data));

export const updateService = createServerFn({ method: "POST" })
  .inputValidator(serviceUpdateSchema)
  .handler(({ data }) => services.updateService(getServiceDeps(), data));

export const deleteService = createServerFn({ method: "POST" })
  .inputValidator(serviceIdSchema)
  .handler(({ data }) => services.deleteService(getServiceDeps(), data.id));
