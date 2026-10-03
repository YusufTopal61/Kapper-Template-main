import type { Metadata } from "next";
import { getServiceDeps } from "@/lib/di/container";
import { listAllServices } from "@/features/services/domain/usecases/list-all-services";
import { ServicesManager } from "@/features/services/presentation/ServicesManager";
import { toServiceUIModel } from "@/features/services/presentation/service.ui-model";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Diensten" };

export default async function ServicesAdminPage() {
  const services = await listAllServices(getServiceDeps());

  return <ServicesManager services={services.map(toServiceUIModel)} />;
}
