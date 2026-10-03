import type { ServiceInput, ServiceUpdate } from "./service.schema";
import type { Service } from "./service.entity";

export type DeleteOutcome = { ok: true } | { ok: false; reason: "in-use" };

/** Poort naar de opslag van diensten. */
export interface ServiceRepository {
  /** Actieve diensten voor de publieke site (leesbaar zonder inlog). */
  listActive(): Promise<Service[]>;
  /** Alle diensten, ook inactieve (onder de rechten van de beheerder). */
  listAll(): Promise<Service[]>;
  /** Server-intern opzoeken, buiten de beheerderssessie om (de boekingsflow is publiek). */
  findById(id: string): Promise<Service | null>;
  highestSortOrder(): Promise<number>;
  create(input: ServiceInput & { sortOrder: number }): Promise<Service>;
  update(patch: ServiceUpdate): Promise<Service>;
  /** Weigert wanneer er boekingen aan de dienst hangen: die historie gooien we niet weg. */
  remove(id: string): Promise<DeleteOutcome>;
}
