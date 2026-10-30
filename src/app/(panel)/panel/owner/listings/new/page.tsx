import Link from "next/link";
import { Button } from "@/shared/ui";
import { ROUTES } from "@/shared/config/routes";
import { getSession } from "@/features/auth";
import { getMySubscription } from "@/features/owner/api/server";
import { PropertyPublishWizard } from "@/features/listings/components/publish/property-publish-wizard";

export default async function NewOwnerListingPage() {
  const session = await getSession();

  let subscription = null;
  try {
    subscription = await getMySubscription();
  } catch {
    subscription = null;
  }

  const approved = session?.professionalStatus === "APPROVED";
  const hasActivePlan = subscription?.status === "ACTIVE";

  return (
    <div className="grid gap-6">
      {!approved ? (
        <div className="rounded-card bg-warning/10 px-4 py-3 text-sm font-semibold text-warning">
          Tu perfil anunciante debe estar aprobado para publicar propiedades.
        </div>
      ) : !hasActivePlan ? (
        <div className="rounded-card border border-edge bg-surface p-6 text-center shadow-[var(--shadow-card)]">
          <p className="text-lg font-semibold text-brand">Necesitas un plan activo para publicar</p>
          <p className="mt-1 text-sm text-muted">
            Activa una membresia pagando con Yape, Plin o transferencia. En cuanto el agente valide tu pago,
            podras publicar tus propiedades.
          </p>
          {/* [OCULTO-DEMO O8] Publicar propiedad: boton "Ver planes y pagar"
          <Link href={ROUTES.panel.owner.subscription} className="mt-4 inline-flex">
            <Button>Ver planes y pagar</Button>
          </Link>
          */}
        </div>
      ) : (
        <PropertyPublishWizard />
      )}
    </div>
  );
}
