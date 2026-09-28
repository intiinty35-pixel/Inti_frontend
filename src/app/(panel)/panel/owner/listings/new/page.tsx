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
      <div className="relative overflow-hidden rounded-card border border-edge bg-surface p-6 shadow-[var(--shadow-card)] sm:p-8">
        <div className="absolute inset-x-0 top-0 h-1.5 bg-brand" aria-hidden />
        <p className="text-[11px] font-black tracking-[0.2em] text-accent uppercase">Publicacion</p>
        <h1 className="mt-2 font-display text-4xl font-black tracking-tight text-brand sm:text-5xl">
          Nueva propiedad
        </h1>
        <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-muted">
          Crea una publicacion clara, verificable y lista para aparecer en ARIZ.
        </p>
      </div>

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
          <Link href={ROUTES.panel.owner.subscription} className="mt-4 inline-flex">
            <Button>Ver planes y pagar</Button>
          </Link>
        </div>
      ) : (
        <PropertyPublishWizard />
      )}
    </div>
  );
}
