import { formatEuro } from "@/lib/utils/format";
import type { Service } from "../domain/service.entity";

/** Precies wat de schermen van een dienst nodig hebben, al opgemaakt. */
export type ServiceUIModel = {
  id: string;
  name: string;
  description: string;
  price: number;
  durationMinutes: number;
  priceLabel: string;
  durationLabel: string;
  isActive: boolean;
};

export function toServiceUIModel(service: Service): ServiceUIModel {
  return {
    id: service.id,
    name: service.name,
    description: service.description,
    price: service.price,
    durationMinutes: service.durationMinutes,
    priceLabel: formatEuro(service.price),
    durationLabel: `${service.durationMinutes} min`,
    isActive: service.isActive,
  };
}
