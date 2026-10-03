import { PlansView } from "@/features/owner/components/plans-view";
import { getMyProfile, getMySubscription, listMyProperties, listPlans } from "@/features/owner/api/server";
import { canManageProjects } from "@/features/owner/lib/profile-permissions";

export default async function OwnerSubscriptionPage() {
  const profile = await getMyProfile().catch(() => null);
  if (profile?.type === "REAL_ESTATE_AGENCY") {
    return (
      <div className="rounded-card border border-edge bg-surface p-8 text-center shadow-[var(--shadow-card)]">
        <p className="text-[11px] font-bold tracking-[0.18em] text-accent uppercase">
          Publicación para inmobiliarias
        </p>
        <h1 className="mt-2 font-display text-3xl font-black text-brand">
          Solicita la habilitación de tus publicaciones
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted">
          Las inmobiliarias no necesitan elegir un plan. Coordina el acuerdo con el gerente desde
          cada propiedad o proyecto y, cuando esté acordado, envía la ficha a revisión.
        </p>
      </div>
    );
  }
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
