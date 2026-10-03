import type { Tables, TablesInsert, TablesUpdate } from "@/lib/supabase/database.types";
import type { Service } from "../domain/service.entity";
import type { ServiceInput, ServiceUpdate } from "../domain/service.schema";

/** The only place that knows the service column names. */
export function toService(row: Tables<"services">): Service {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    price: row.price,
    durationMinutes: row.duration_minutes,
    isActive: row.is_active,
    sortOrder: row.sort_order,
  };
}

export function toServiceInsert(
  input: ServiceInput & { sortOrder: number },
): TablesInsert<"services"> {
  return {
    name: input.name,
    description: input.description,
    price: input.price,
    duration_minutes: input.durationMinutes,
    is_active: input.isActive,
    sort_order: input.sortOrder,
  };
}

/** Only the fields that were actually provided end up in the update. */
export function toServiceUpdate(patch: Omit<ServiceUpdate, "id">): TablesUpdate<"services"> {
  return {
    ...(patch.name !== undefined && { name: patch.name }),
    ...(patch.description !== undefined && { description: patch.description }),
    ...(patch.price !== undefined && { price: patch.price }),
    ...(patch.durationMinutes !== undefined && { duration_minutes: patch.durationMinutes }),
    ...(patch.isActive !== undefined && { is_active: patch.isActive }),
  };
}
