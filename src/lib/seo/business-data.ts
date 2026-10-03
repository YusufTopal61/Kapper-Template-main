import "server-only";
import { getSiteUrl } from "@/lib/env.server";
import type { BusinessData } from "@/lib/seo/structured-data";

/** Structural input, so lib/ does not depend on any feature's types. */
type BusinessSettingsInput = {
  businessName: string;
  phoneNumber: string | null;
  address: string | null;
  openingHours: BusinessData["openingHours"];
};

/** Maps the business settings from the database to what the JSON-LD builders need. */
export function toBusinessData(settings: BusinessSettingsInput): BusinessData {
  return {
    name: settings.businessName,
    url: getSiteUrl(),
    phone: settings.phoneNumber,
    address: settings.address,
    openingHours: settings.openingHours,
  };
}
