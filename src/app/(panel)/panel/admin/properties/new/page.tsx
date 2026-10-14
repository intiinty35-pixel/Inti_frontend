import { PropertyPublishWizard } from "@/features/listings/components/publish/property-publish-wizard";

export default function AdminNewPropertyPage() {
  return (
    <div className="grid gap-6">
      <PropertyPublishWizard audience="admin" />
    </div>
  );
}
