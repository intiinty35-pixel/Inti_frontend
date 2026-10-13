import { notFound } from "next/navigation";
import { getOwnerPropertyForEditServer } from "@/features/listings/api/server";
import { PropertyPublishWizard } from "@/features/listings/components/publish/property-publish-wizard";

export default async function EditOwnerListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const property = await getOwnerPropertyForEditServer(id);
  if (!property) notFound();

  return (
    <div className="grid gap-6">
      <PropertyPublishWizard initialProperty={property} />
    </div>
  );
}
