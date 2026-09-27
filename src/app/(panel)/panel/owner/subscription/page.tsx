import { OwnerPageHeader } from "@/app/(panel)/panel/owner/owner-shell";
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
      <OwnerPageHeader eyebrow="Planes y suscripción" title="Elige el plan para tu negocio" />
      <p className="-mt-4 text-sm text-muted">
        Los límites y precios se obtienen de la configuración comercial.
      </p>
      <PlansView
        plans={plans}
        subscription={subscription}
        propertiesCount={properties.length}
        projectsCount={0}
      />
    </div>
  );
}
