import type { Metadata } from "next";
import { getServiceDeps } from "@/app/di/container";
import { listAllServices } from "@/modules/services/domain/usecases/listAllServices";
import { ServicesManager } from "@/modules/services/presentation/ServicesManager";
import { naarServiceUIModel } from "@/modules/services/presentation/service.uimodel";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Diensten" };

export default async function DienstenBeheerPagina() {
  const diensten = await listAllServices(getServiceDeps());

  return <ServicesManager diensten={diensten.map(naarServiceUIModel)} />;
}
