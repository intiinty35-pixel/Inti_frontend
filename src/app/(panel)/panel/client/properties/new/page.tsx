import Link from "next/link";
import { Button } from "@/shared/ui";
import { ROUTES } from "@/shared/config/routes";
import { getCustomerMembership } from "@/features/customer-account/api/server";
import { PublicationCountdown } from "@/features/customer-account/components/publication-countdown";
import { CUSTOMER_TRIAL_PLAN_SLUG } from "@/features/customer-account/types/customer-account";
import { PropertyPublishWizard } from "@/features/listings/components/publish/property-publish-wizard";

export default async function NewCustomerPropertyPage() {
  const membership = await getCustomerMembership();
  const subscription = membership.subscription;
  const canPublishFirst = membership.trialAvailable;
  const hasRoom =
    subscription?.status === "ACTIVE" &&
    membership.propertyCount < subscription.plan.propertyLimit;
  const awaitingReview = subscription?.status === "PENDING_PAYMENT";
  const activeWithoutCapacity =
    subscription?.status === "ACTIVE" &&
    membership.propertyCount >= subscription.plan.propertyLimit;
  const freeTrialActive =
    subscription?.status === "ACTIVE" &&
    subscription.plan.slug === CUSTOMER_TRIAL_PLAN_SLUG;

  return (
    <div className="grid min-w-0 gap-6">
      <header className="relative min-h-48 overflow-hidden rounded-card border border-edge bg-surface p-6 shadow-[var(--shadow-card)] sm:p-8">
        <div className="absolute inset-x-0 top-0 h-1.5 bg-brand" aria-hidden />
        <div className="flex min-h-32 flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <p className="text-[11px] font-black tracking-[0.2em] text-accent uppercase">
              Publicación particular
            </p>
            <h1 className="mt-2 font-display text-3xl font-black tracking-tight text-brand sm:text-4xl">
              Nueva propiedad
            </h1>
            <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-muted">
              Completa los mismos pasos y usa el mismo asistente de publicación que los agentes inmobiliarios.
            </p>
          </div>
          {canPublishFirst ? (
            <span className="inline-flex w-fit shrink-0 items-center rounded-full bg-success/10 px-4 py-2 text-sm font-bold text-success">
              Primera publicación · 30 días gratis
            </span>
          ) : hasRoom && !freeTrialActive ? (
            <span className="inline-flex w-fit shrink-0 items-center rounded-full bg-brand-soft px-4 py-2 text-sm font-bold text-brand">
              {membership.propertyCount}/{subscription.plan.propertyLimit} propiedades del paquete
            </span>
          ) : null}
        </div>
        {freeTrialActive && subscription.expiresAt ? (
          <div className="mt-5 max-w-md rounded-card border border-edge bg-canvas p-4">
            <PublicationCountdown
              expiresAt={subscription.expiresAt}
              label="Tiempo restante de tu primera publicación gratis"
            />
          </div>
        ) : null}
      </header>
      {canPublishFirst || hasRoom ? (
        <PropertyPublishWizard audience="customer" />
      ) : (
        <div className="relative overflow-hidden rounded-card border border-edge bg-surface p-6 shadow-[var(--shadow-card)] sm:p-8">
          <div className="absolute inset-x-0 top-0 h-1.5 bg-accent" aria-hidden />
          <div className="mx-auto grid max-w-2xl justify-items-center gap-3 py-5 text-center">
            <p className="text-[11px] font-black tracking-[0.18em] text-accent uppercase">
              {awaitingReview ? "Solicitud en proceso" : "Membresía de publicaciones"}
            </p>
            <h2 className="font-display text-2xl font-black tracking-tight text-brand sm:text-3xl">
              {awaitingReview
                ? "Tu comprobante está en revisión"
                : activeWithoutCapacity
                  ? "Alcanzaste el límite de propiedades de tu paquete"
                  : "Necesitas una membresía activa para publicar"}
            </h2>
            <p className="text-sm leading-6 text-muted">
              {awaitingReview
                ? "Cuando el administrador apruebe el pago, se habilitarán las propiedades de tu paquete."
                : activeWithoutCapacity
                  ? `Tu paquete incluye ${subscription.plan.propertyLimit} propiedades activas. Revisa las opciones de membresía para ampliar tu capacidad.`
                  : "Después de tu primera publicación gratuita, elige uno de los cuatro paquetes de 30 días y envía tu comprobante para revisión."}
            </p>
            {!awaitingReview ? (
              <Link href={ROUTES.panel.client.membership} className="mt-2">
                <Button>Ver paquetes de publicación</Button>
              </Link>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
