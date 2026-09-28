import { PlansView } from "@/features/owner/components/plans-view";
import { getMySubscription, listMyProperties, listPlans } from "@/features/owner/api/server";

export default async function OwnerSubscriptionPage() {
  const [plans, subscription, properties] = await Promise.all([
    listPlans(),
    getMySubscription(),
    listMyProperties(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <p className="text-[11px] font-bold tracking-[0.18em] text-accent uppercase">Planes y suscripcion</p>
        <h1 className="mt-1 text-3xl font-light tracking-tight text-brand">Elige el plan para tu negocio</h1>
        <p className="mt-2 text-sm text-muted">
          Los limites y precios se obtienen de la configuracion comercial.
        </p>
      </div>

      <PlansView
        plans={plans}
        subscription={subscription}
        propertiesCount={properties.length}
        projectsCount={0}
      />
    </div>
  );
}
