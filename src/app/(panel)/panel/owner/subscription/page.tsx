import { PlansView } from "@/features/owner/components/plans-view";
import { getMyProfile, getMySubscription, listMyProperties, listPlans } from "@/features/owner/api/server";
import { canManageProjects } from "@/features/owner/lib/profile-permissions";

export default async function OwnerSubscriptionPage() {
  const [plans, subscription, properties, profile] = await Promise.all([
    listPlans(),
    getMySubscription(),
    listMyProperties(),
    getMyProfile().catch(() => null),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <p className="text-[11px] font-bold tracking-[0.18em] text-accent uppercase">Planes y suscripcion</p>
        <h1 className="mt-1 text-3xl font-light tracking-tight text-brand">Elige el plan para tu negocio</h1>
        <p className="mt-2 text-sm text-muted">
          Consulta los planes y solicita al administrador la activación o renovación de tu suscripción.
        </p>
      </div>

      <PlansView
        plans={plans}
        subscription={subscription}
        propertiesCount={properties.length}
        projectsCount={0}
        canManageProjects={canManageProjects(profile)}
      />
    </div>
  );
}
