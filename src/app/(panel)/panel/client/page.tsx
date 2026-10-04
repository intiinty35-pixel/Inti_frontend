import Link from "next/link";
import { Button, Card, CardContent } from "@/shared/ui";
import { getSession } from "@/features/auth";
import { getFavorites } from "@/features/favorites/api";
import { getCustomerMembership } from "@/features/customer-account/api/server";
import { listMyProperties } from "@/features/owner/api/server";
import { StatCard } from "@/features/owner/components/dashboard-ui";
import { PublicationCalendar } from "@/features/owner/components/publication-calendar";
import { RecentMovements } from "@/features/owner/components/recent-movements";
import { PublicationCountdown } from "@/features/customer-account/components/publication-countdown";
import { CUSTOMER_TRIAL_PLAN_SLUG } from "@/features/customer-account/types/customer-account";
import { ROUTES } from "@/shared/config/routes";

function daysRemaining(expiresAt: string | null): number | null {
  if (!expiresAt) return null;
  return Math.max(0, Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 86_400_000));
}

export default async function PanelClientPage() {
  const [session, properties, membership, favorites] = await Promise.all([
    getSession(),
    listMyProperties(),
    getCustomerMembership(),
    getFavorites(),
  ]);
  const active = properties.filter((property) => property.status === "disponible").length;
  const paused = properties.filter((property) => property.status === "reservado").length;
  const rentals = properties.filter((property) => property.operation === "rent").length;
  const subscription = membership.subscription;
  const activeMembership = subscription?.status === "ACTIVE";
  const freeTrialActive =
    activeMembership && subscription.plan.slug === CUSTOMER_TRIAL_PLAN_SLUG;
  // eslint-disable-next-line react-hooks/purity -- server component: fecha fija por solicitud para calcular vigencia.
  const now = Date.now();
  const trialRemaining = activeMembership ? daysRemaining(subscription.expiresAt) : null;
  const firstName = (session?.name ?? "Usuario").trim().split(/\s+/)[0];

  return (
    <div className="min-w-0">
      <section className="grid min-w-0 grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(340px,400px)] 2xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="flex min-w-0 flex-col gap-6">
          <header className="relative min-h-56 overflow-hidden rounded-card border border-edge bg-surface p-6 shadow-[var(--shadow-card)] sm:p-8">
            <div className="absolute inset-x-0 top-0 h-1.5 bg-brand" aria-hidden />
            <div className="relative flex min-h-40 flex-col justify-between gap-6 lg:flex-row lg:items-start">
              <div className="max-w-4xl">
                <p className="text-[11px] font-black tracking-[0.2em] text-accent uppercase">Bienvenido</p>
                <h1 className="mt-2 font-display text-4xl font-black tracking-tight text-brand sm:text-5xl lg:text-6xl">
                  Hola, {firstName}
                </h1>
                <p className="mt-4 max-w-2xl text-sm font-medium leading-6 text-muted">
                  Administra tus propiedades, consulta tus favoritos y revisa el estado de tus
                  publicaciones desde tu cuenta ARIZ.
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap gap-3">
                <Link href={ROUTES.panel.client.membership}>
                  <Button variant="secondary">Ver membresía</Button>
                </Link>
                <Link href={ROUTES.panel.client.newProperty}>
                  <Button>Publicar propiedad</Button>
                </Link>
              </div>
            </div>
          </header>

          <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 min-[1500px]:grid-cols-4">
            <StatCard
              label="Mis propiedades"
              value={String(properties.length)}
              hint={`${active} publicadas / ${paused} pausadas`}
            />
            <StatCard label="Propiedades en alquiler" value={String(rentals)} hint="Anuncios de alquiler" />
            <StatCard label="Mis favoritos" value={String(favorites.length)} hint="Propiedades guardadas" />
            <StatCard
              label={membership.trialAvailable ? "Publicación gratuita" : "Membresía"}
              value={
                membership.trialAvailable
                  ? "30 días"
                  : activeMembership
                    ? `${trialRemaining ?? 0} días`
                    : subscription?.status === "PENDING_PAYMENT"
                      ? "En revisión"
                      : "Sin plan"
              }
              hint={
                membership.trialAvailable
                  ? "Para tu primera propiedad"
                  : activeMembership
                    ? subscription.plan.name
                    : "Consulta tus opciones"
              }
            />
          </div>

          <section className="grid min-w-0 grid-cols-1 gap-5 lg:grid-cols-2">
            <Card className="overflow-hidden border-edge bg-[linear-gradient(180deg,#ffffff_0%,#f9fafc_100%)]">
              <div className="h-1 bg-brand" aria-hidden />
              <CardContent className="flex min-h-52 flex-col justify-between gap-5 pt-6">
                <div>
                  <p className="text-[11px] font-black tracking-[0.18em] text-accent uppercase">Tus publicaciones</p>
                  <h2 className="mt-2 font-display text-2xl font-black tracking-tight text-brand">
                    {properties.length ? "Administra tus propiedades" : "Publica tu primera propiedad"}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-muted">
                    {membership.trialAvailable
                      ? "Tu primera publicación tiene 30 días gratuitos. Usa el mismo asistente de publicación que los agentes."
                      : `${properties.length} propiedades registradas, ${active} publicadas y ${paused} pausadas.`}
                  </p>
                </div>
                <Link href={ROUTES.panel.client.properties} className="text-sm font-bold text-brand hover:underline">
                  Ver mis propiedades
                </Link>
              </CardContent>
            </Card>
            <Card className="overflow-hidden border-edge bg-[linear-gradient(180deg,#ffffff_0%,#f9fafc_100%)]">
              <div className="h-1 bg-accent" aria-hidden />
              <CardContent className="flex min-h-52 flex-col justify-between gap-5 pt-6">
                <div>
                  <p className="text-[11px] font-black tracking-[0.18em] text-accent uppercase">Membresía de publicaciones</p>
                  <h2 className="mt-2 font-display text-2xl font-black tracking-tight text-brand">
                    {membership.trialAvailable ? "Empieza sin costo" : activeMembership ? "Tu plan está activo" : "Elige tu paquete"}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-muted">
                    {membership.trialAvailable
                      ? "Tu primera propiedad tendrá 30 días gratis. El contador comienza cuando se publique."
                      : activeMembership
                        ? `${subscription.plan.name}: ${membership.propertyCount}/${subscription.plan.propertyLimit} propiedades activas.`
                        : "Envía el comprobante y el administrador activará los beneficios al aprobar el pago."}
                  </p>
                  {freeTrialActive && subscription.expiresAt ? (
                    <div className="mt-4 max-w-sm">
                      <PublicationCountdown
                        expiresAt={subscription.expiresAt}
                        label="Tiempo restante gratis"
                      />
                    </div>
                  ) : null}
                </div>
                <Link href={ROUTES.panel.client.membership} className="text-sm font-bold text-brand hover:underline">
                  Revisar membresía
                </Link>
              </CardContent>
            </Card>
          </section>
        </div>

        <aside className="flex min-w-0 flex-col gap-5 xl:sticky xl:top-28 xl:self-start">
          <PublicationCalendar
            properties={properties}
            expiresAt={subscription?.expiresAt}
            now={now}
          />
          <RecentMovements
            properties={properties}
            leads={[]}
            subscription={subscription}
          />
          <Card className="overflow-hidden">
            <div className="h-1.5 bg-brand" aria-hidden />
            <CardContent className="flex flex-col gap-3 pt-6">
              <p className="text-[11px] font-black tracking-[0.18em] text-accent uppercase">
                Accesos rápidos
              </p>
              <Link
                href={ROUTES.panel.client.profile}
                className="rounded-card border border-edge px-4 py-3 text-sm font-semibold text-brand hover:border-brand"
              >
                Mi perfil y contraseña
              </Link>
              <Link
                href={ROUTES.panel.client.rentals}
                className="rounded-card border border-edge px-4 py-3 text-sm font-semibold text-brand hover:border-brand"
              >
                Mis alquileres ({rentals})
              </Link>
              <Link
                href={ROUTES.panel.client.favorites}
                className="rounded-card border border-edge px-4 py-3 text-sm font-semibold text-brand hover:border-brand"
              >
                Mis favoritos ({favorites.length})
              </Link>
            </CardContent>
          </Card>
        </aside>
      </section>
    </div>
  );
}
