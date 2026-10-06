import { PlansView } from "@/features/owner/components/plans-view";
import { getMyProfile, getMySubscription, listMyProperties, listPlans } from "@/features/owner/api/server";
import { canManageProjects } from "@/features/owner/lib/profile-permissions";
import { PageBanner } from "@/features/owner/components/dashboard-ui";

export default async function OwnerSubscriptionPage() {
  const profile = await getMyProfile().catch(() => null);
  if (profile?.type === "REAL_ESTATE_AGENCY") {
    return (
      <PageBanner
        eyebrow="Publicación para inmobiliarias"
        title="Solicita la habilitación de tus publicaciones"
        description="Las inmobiliarias no necesitan elegir un plan. Coordina el acuerdo con el gerente desde cada propiedad o proyecto y, cuando esté acordado, envía la ficha a revisión."
      />
    );
  }
  const [plans, subscription, properties] = await Promise.all([
    listPlans(),
    getMySubscription(),
    listMyProperties(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <PageBanner
        eyebrow="Planes y suscripción"
        title="Elige el plan para tu negocio"
        description="Consulta los planes y solicita al administrador la activación o renovación de tu suscripción."
      />

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
