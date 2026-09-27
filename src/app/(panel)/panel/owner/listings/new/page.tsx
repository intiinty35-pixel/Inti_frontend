import { getSession } from "@/features/auth";
import { PropertyPublishWizard } from "@/features/listings/components/publish/property-publish-wizard";

export default async function NewOwnerListingPage() {
  const session = await getSession();
  const blocked = session?.professionalStatus !== "APPROVED";

  return (
    <div className="grid gap-6">
      <div>
        <p className="text-sm text-muted">Crea una publicación clara, verificable y lista para aparecer en ARIZ.</p>
        <h1 className="text-3xl font-light text-brand">Nueva propiedad</h1>
      </div>
      {blocked ? (
        <div className="rounded-card bg-warning/10 px-4 py-3 text-sm font-semibold text-warning">
          Tu perfil anunciante debe estar aprobado para publicar propiedades.
        </div>
      ) : (
        <PropertyPublishWizard />
      )}
    </div>
  );
}
