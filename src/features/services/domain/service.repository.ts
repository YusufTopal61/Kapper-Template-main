import type { ServiceInput, ServiceUpdate } from "./service.schema";
import type { Service } from "./service.entity";

export type DeleteOutcome = { ok: true } | { ok: false; reason: "in-use" };

/** Port to the storage of services. */
export interface ServiceRepository {
  /** Active services for the public site (readable without signing in). */
  listActive(): Promise<Service[]>;
  /** All services, including inactive ones (under the admin's permissions). */
  listAll(): Promise<Service[]>;
  /** Server-internal lookup, outside the admin session (the booking flow is public). */
  findById(id: string): Promise<Service | null>;
  highestSortOrder(): Promise<number>;
  create(input: ServiceInput & { sortOrder: number }): Promise<Service>;
  update(patch: ServiceUpdate): Promise<Service>;
  /** Refuses when bookings reference the service: we do not throw away that history. */
  remove(id: string): Promise<DeleteOutcome>;
}
