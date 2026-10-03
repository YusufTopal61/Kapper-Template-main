import type { ServiceRow } from "@/shared/lib/supabase/database.types";
import type { Service } from "../domain/service.entity";

export function naarService(rij: ServiceRow): Service {
  return {
    id: rij.id,
    naam: rij.naam,
    beschrijving: rij.beschrijving,
    prijs: rij.prijs,
    duur_minuten: rij.duur_minuten,
    actief: rij.actief,
    sorteer_volgorde: rij.sorteer_volgorde,
  };
}
