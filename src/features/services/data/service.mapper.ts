import type { Tables, TablesInsert, TablesUpdate } from "@/lib/supabase/database.types";
import type { Service } from "../domain/service.entity";
import type { ServiceInput, ServiceUpdate } from "../domain/service.schema";

/**
 * The live schema uses Dutch column names. This file is the only place that
 * knows them: everything above the data layer works with the English entity.
 */
export function toService(row: Tables<"services">): Service {
  return {
    id: row.id,
    name: row.naam,
    description: row.beschrijving,
    price: row.prijs,
    durationMinutes: row.duur_minuten,
    isActive: row.actief,
    sortOrder: row.sorteer_volgorde,
  };
}

export function toServiceInsert(
  input: ServiceInput & { sortOrder: number },
): TablesInsert<"services"> {
  return {
    naam: input.name,
    beschrijving: input.description,
    prijs: input.price,
    duur_minuten: input.durationMinutes,
    actief: input.isActive,
    sorteer_volgorde: input.sortOrder,
  };
}

/** Only the fields that were actually provided end up in the update. */
export function toServiceUpdate(patch: Omit<ServiceUpdate, "id">): TablesUpdate<"services"> {
  return {
    ...(patch.name !== undefined && { naam: patch.name }),
    ...(patch.description !== undefined && { beschrijving: patch.description }),
    ...(patch.price !== undefined && { prijs: patch.price }),
    ...(patch.durationMinutes !== undefined && { duur_minuten: patch.durationMinutes }),
    ...(patch.isActive !== undefined && { actief: patch.isActive }),
  };
}
