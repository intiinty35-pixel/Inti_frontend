import { notFound } from "next/navigation";
import { getAdminIncentiveServer } from "@/features/rewards/api/server";
import { EditIncentiveForm } from "@/features/rewards/components/edit-incentive-form";

export default async function EditIncentivePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const incentive = await getAdminIncentiveServer(id);

  if (!incentive) {
    notFound();
  }

  return <EditIncentiveForm id={id} incentive={incentive} />;
}
