import { Card, CardContent } from "@/shared/ui";
import { PlansView } from "@/features/owner/components/plans-view";
import { getMyProfile, getMySubscription, listMyProperties, listPlans } from "@/features/owner/api/server";
import { canManageProjects } from "@/features/owner/lib/profile-permissions";
import { AgencyPublicationContact } from "@/features/owner/components/agency-publication-contact";
import { PageBanner } from "@/features/owner/components/dashboard-ui";

const MANAGER_WHATSAPP = "51999999999";

export default async function OwnerSubscriptionPage() {
  const profile = await getMyProfile().catch(() => null);

  if (profile?.type === "REAL_ESTATE_AGENCY") {
    const businessName =
      profile.businessName?.trim() ||
      [profile.user.firstName, profile.user.lastName].filter(Boolean).join(" ").trim() ||
      "mi inmobiliaria";
    const message = `Hola ARIZ, soy ${businessName}. Quiero coordinar la habilitacion de publicaciones para mi inmobiliaria.`;
    const whatsappUrl = `https://wa.me/${MANAGER_WHATSAPP}?text=${encodeURIComponent(message)}`;

    return (
      <div className="flex flex-col gap-6">
        <PageBanner
          eyebrow="Publicacion para inmobiliarias"
          title="Solicita la habilitacion de tus publicaciones"
          description="Las inmobiliarias no necesitan elegir un plan. Coordina el acuerdo con el gerente desde cada propiedad o proyecto y, cuando este acordado, envia la ficha a revision."
        />

        <Card className="overflow-hidden border-brand/20">
          <div className="h-1 bg-brand" aria-hidden />
          <CardContent className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.16em] text-accent">
                Contacto directo
              </p>
              <h2 className="mt-1 font-display text-2xl font-black tracking-tight text-brand">
                Coordina con el gerente de ARIZ
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
                Escribenos para acordar la habilitacion de publicaciones, cupos, revision y condiciones de trabajo para tu inmobiliaria.
              </p>
            </div>

            <AgencyPublicationContact
              businessName={businessName}
              email={profile.user.email}
              phone={profile.whatsapp ?? profile.user.phone}
              whatsappUrl={whatsappUrl}
            />
          </CardContent>
        </Card>
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
      <PageBanner
        eyebrow="Planes y suscripcion"
        title="Elige el plan para tu negocio"
        description="Consulta los planes y solicita al administrador la activacion o renovacion de tu suscripcion."
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
