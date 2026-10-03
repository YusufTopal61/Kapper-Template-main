import { formatEuro } from "@/shared/lib/format";
import type { Service } from "../domain/service.entity";

/** Precies wat de schermen van een dienst nodig hebben, al opgemaakt. */
export type ServiceUIModel = {
  id: string;
  naam: string;
  beschrijving: string;
  prijs: number;
  duurMinuten: number;
  prijsLabel: string;
  duurLabel: string;
  actief: boolean;
};

export function naarServiceUIModel(dienst: Service): ServiceUIModel {
  return {
    id: dienst.id,
    naam: dienst.naam,
    beschrijving: dienst.beschrijving,
    prijs: dienst.prijs,
    duurMinuten: dienst.duur_minuten,
    prijsLabel: formatEuro(dienst.prijs),
    duurLabel: `${dienst.duur_minuten} min`,
    actief: dienst.actief,
  };
}
