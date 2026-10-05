import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/shared/ui";
import { cn } from "@/shared/lib/cn";
import { formatPrice } from "@/shared/lib/format";
import { formatPublishedDate } from "@/shared/lib/published-date";
import { buildMetadata } from "@/shared/lib/seo";
import {
  AreaIcon,
  ArrowRightIcon,
  BuildingIcon,
  CalendarIcon,
  CheckIcon,
  ClockIcon,
  PinIcon,
  RulerIcon,
  WhatsappIcon,
} from "@/shared/ui/icons";
import { PropertyPhotoGallery } from "@/features/listings/components/property-photo-gallery";
import { ProjectTourVideo } from "@/features/listings/components/project-tour-video";
import { ExpandableText } from "@/features/listings/components/expandable-text";
import { LazyPropertyLocationMap } from "@/features/listings/components/property-location-map-client";
import { QuickQuestions } from "@/features/listings/components/Quickquestions";
import { SharePropertyButton } from "@/features/listings/components/share-property-button";
import { getProjectBySlugServer } from "@/features/projects/api/server";
import type { ProjectApiDetail } from "@/features/projects/types/api";
import { LeadForm } from "@/features/leads";

interface ProjectPageProps {
  params: Promise<{ slug: string }>;
}

const STAGE_LABEL: Record<string, string> = {
  PRE_SALE: "En preventa",
  UNDER_CONSTRUCTION: "En construcción",
  READY: "Listo para entregar",
  COMPLETED: "Proyecto terminado",
};

const LOT_MODE_LABEL: Record<string, string> = {
  INDIVIDUAL: "Lotes individuales",
  GROUPED: "Lotes agrupados",
  MIXED: "Lotes mixtos",
};

const LOT_STATUS_LABEL: Record<string, string> = {
  AVAILABLE: "Disponible",
  RESERVED: "Reservado",
  SOLD: "Vendido",
};

const AGENT_TYPE_LABEL: Record<string, string> = {
  REAL_ESTATE_AGENCY: "Inmobiliaria",
  INDEPENDENT_AGENT: "Agente inmobiliario",
  REAL_ESTATE_AGENT: "Agente inmobiliario",
  DEVELOPER: "Desarrollador",
  ARCHITECT: "Arquitecto",
};

const CURRENCY_FALLBACK: Record<string, "PEN" | "USD"> = { PEN: "PEN", USD: "USD" };

/** Los catalogos llegan como slugs (club-house, defensa-civil) o como texto libre. */
function humanize(value: string) {
  return value
    .replace(/[-_]/g, " ")
    .replace(/^\w/, (char) => char.toUpperCase());
}

function formatMonthYear(iso: string | null) {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("es-PE", { month: "long", year: "numeric" });
}

function priceRange(project: ProjectApiDetail) {
  const currency = CURRENCY_FALLBACK[project.currency] ?? "PEN";
  const from = formatPrice(project.priceFrom, currency);
  if (project.priceTo && project.priceTo !== project.priceFrom) {
    return `${from} - ${formatPrice(project.priceTo, currency)}`;
  }
  return from;
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const project = await getProjectBySlugServer(slug);
    return buildMetadata({
      title: `${project.name} | ARIZ`,
      description: project.description.slice(0, 160),
      path: `/project/${slug}`,
      image: project.coverImage ?? undefined,
    });
  } catch {
    return buildMetadata({
      title: "Proyecto | ARIZ",
      description: "Detalle de proyecto inmobiliario.",
      path: `/project/${slug}`,
    });
  }
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  let project: ProjectApiDetail;
  try {
    project = await getProjectBySlugServer(slug);
  } catch {
    notFound();
  }

  const images = project.media.filter((item) => item.type === "IMAGE").map((item) => item.url);
  const gallery = images.length > 0 ? images : project.images;
  const plans = project.media.filter((item) => item.type === "FLOOR_PLAN");
  const renders = project.media.filter((item) => item.type === "RENDER");

  const locationLine = [
    project.location?.zone,
    project.location?.street,
    project.location?.district,
    project.location?.province,
    project.location?.department,
  ]
    .filter(Boolean)
    .join(", ");

  const lat = Number(project.location?.latitude);
  const lng = Number(project.location?.longitude);
  const hasCoords = Number.isFinite(lat) && Number.isFinite(lng);
  const whatsappDigits = project.agent.whatsapp?.replace(/\D/g, "");
  const whatsappUrl = whatsappDigits
    ? `https://wa.me/${whatsappDigits}?text=${encodeURIComponent(
        `Hola, vi el proyecto "${project.name}" en ARIZ y quisiera más información.`,
      )}`
    : undefined;

  const deliveryLabel = formatMonthYear(project.estimatedDelivery);
  const startLabel = formatMonthYear(project.constructionStart);
  const areaLabel = project.areaRange?.min
    ? project.areaRange.max && project.areaRange.max !== project.areaRange.min
      ? `${project.areaRange.min} - ${project.areaRange.max} m²`
      : `${project.areaRange.min} m²`
    : null;

  const stripItems: Array<{ key: string; text: string; icon: typeof AreaIcon }> = [
    ...(areaLabel ? [{ key: "area", text: areaLabel, icon: AreaIcon as typeof AreaIcon }] : []),
    ...(project.totalLots
      ? [
          {
            key: "lots",
            text: `${project.totalLots} ${project.totalLots === 1 ? "lote" : "lotes"}`,
            icon: RulerIcon as typeof AreaIcon,
          },
        ]
      : []),
    ...(project.totalBlocks
      ? [
          {
            key: "blocks",
            text: `${project.totalBlocks} ${project.totalBlocks === 1 ? "pavimento" : "pavimentos"}`,
            icon: BuildingIcon as typeof AreaIcon,
          },
        ]
      : []),
    ...(startLabel ? [{ key: "start", text: `Inicio ${startLabel}`, icon: CalendarIcon as typeof AreaIcon }] : []),
    ...(deliveryLabel
      ? [{ key: "delivery", text: `Entrega ${deliveryLabel}`, icon: CheckIcon as typeof AreaIcon }]
      : []),
  ];

  const detailRows: Array<{ label: string; value: string }> = [
    { label: "Tipo de proyecto", value: LOT_MODE_LABEL[project.lotMode] ?? humanize(project.lotMode) },
    { label: "Etapa", value: STAGE_LABEL[project.stage] ?? humanize(project.stage) },
    ...(project.developer ? [{ label: "Desarrollador", value: project.developer }] : []),
    ...(project.totalBlocks ? [{ label: "Pavimentos", value: String(project.totalBlocks) }] : []),
    ...(project.totalLots ? [{ label: "Lotes totales", value: String(project.totalLots) }] : []),
    ...(startLabel ? [{ label: "Inicio de obras", value: startLabel }] : []),
    ...(deliveryLabel ? [{ label: "Entrega estimada", value: deliveryLabel }] : []),
    ...(project.downPayment ? [{ label: "Cuota inicial desde", value: formatPrice(project.downPayment, CURRENCY_FALLBACK[project.currency] ?? "PEN") }] : []),
    ...(project.monthlyPayment ? [{ label: "Cuota mensual desde", value: formatPrice(project.monthlyPayment, CURRENCY_FALLBACK[project.currency] ?? "PEN") }] : []),
    ...(project.urbanizationName ? [{ label: "Urbanización", value: project.urbanizationName }] : []),
    ...(project.registryEntry ? [{ label: "Partida registral", value: project.registryEntry }] : []),
    ...(project.ruc ? [{ label: "RUC", value: project.ruc }] : []),
  ];

  const half = Math.ceil(project.amenities.length / 2);
  const amenitiesA = project.amenities.slice(0, half);
  const amenitiesB = project.amenities.slice(half);
  const agentTypeLabel = project.agent.type === "ADMIN"
    ? "Publicado por ARIZ"
    : AGENT_TYPE_LABEL[project.agent.type] ?? "Agente inmobiliario";
  const hasFullData =
    detailRows.length > 0 || project.amenities.length > 0 || project.services.length > 0;
  const published = formatPublishedDate(project.publishedAt, project.createdAt);

  return (
    <Container size="full" className="flex flex-1 flex-col py-6 lg:py-8">
      <div className="grid flex-1 items-start gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,3fr)] xl:gap-8">
        <main className="min-w-0">
          <PropertyPhotoGallery
            images={gallery}
            title={project.name}
            className="h-[300px] sm:h-[440px] lg:h-[520px] 2xl:h-[600px]"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-brand px-3 py-1.5 text-[11px] font-black tracking-[0.14em] text-accent uppercase">
                {STAGE_LABEL[project.stage] ?? "Proyecto"}
              </span>
              {project.featured ? (
                <span className="rounded-full bg-accent px-3 py-1.5 text-[11px] font-black tracking-[0.14em] text-brand uppercase">
                  Destacado
                </span>
              ) : null}
            </div>
            {project.tourUrl ? (
              <ProjectTourVideo
                projectName={project.name}
                url={project.tourUrl}
                className="absolute right-3 bottom-3 z-10 sm:right-4 sm:bottom-4"
              />
            ) : null}
          </PropertyPhotoGallery>

          <header className="mt-5 flex items-start justify-between gap-3 lg:mt-6">
            <div className="min-w-0 flex-1">
              <h1 className="title-listing">{project.name}</h1>
              <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-muted lg:text-base">
                <PinIcon className="size-4 shrink-0 text-brand lg:size-5" />
                <span className="line-clamp-2">{locationLine}</span>
              </p>
              {published ? (
                <time dateTime={published.iso} className="mt-2 flex items-center gap-2 text-sm font-semibold text-muted">
                  <ClockIcon className="size-4 shrink-0 text-brand" />
                  {published.fullWithPrefix}
                </time>
              ) : null}
            </div>
            <SharePropertyButton title={project.name} />
          </header>

          <section className="mt-6 grid gap-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center lg:mt-8">
            <div className="min-w-0">
              <p className="font-display text-2xl leading-none font-black tracking-tight text-brand lg:text-3xl">
                {priceRange(project)}
              </p>
              {project.downPayment || project.monthlyPayment ? (
                <p className="mt-2 text-sm font-semibold text-muted">
                  {project.downPayment
                    ? `Desde ${formatPrice(project.downPayment, CURRENCY_FALLBACK[project.currency] ?? "PEN")} de cuota inicial`
                    : null}
                  {project.downPayment && project.monthlyPayment ? " · " : null}
                  {project.monthlyPayment
                    ? `${formatPrice(project.monthlyPayment, CURRENCY_FALLBACK[project.currency] ?? "PEN")} / mes`
                    : null}
                </p>
              ) : null}
            </div>

            {whatsappUrl ? (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="flex h-11 items-center justify-center gap-2 rounded-card bg-[#25d366] px-5 text-sm font-bold text-white transition-colors hover:bg-[#1fb857]"
              >
                <WhatsappIcon className="size-4" />
                Contactar por WhatsApp
              </a>
            ) : null}
          </section>

          {stripItems.length > 0 ? (
            <section className="mt-8 border-y border-edge py-8">
              <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-6">
                {stripItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.key} className="flex flex-col items-center gap-3 text-center">
                      <Icon className="size-7 text-ink" />
                      <span className="text-sm font-semibold text-ink capitalize">{item.text}</span>
                    </li>
                  );
                })}
              </ul>
            </section>
          ) : null}

          <section className="mt-9">
            <h2 className="font-display text-xl font-black tracking-tight text-brand lg:text-2xl">
              Descripción
            </h2>
            <ExpandableText
              text={project.description}
              lines={4}
              className="mt-3 max-w-5xl text-sm leading-7 whitespace-pre-line text-muted lg:text-[15px] lg:leading-8"
            />
          </section>

          {hasFullData ? (
            <section className="mt-9 rounded-card border border-edge bg-surface p-5 shadow-[var(--shadow-card)] sm:p-7">
              <h2 className="font-display text-xl font-black tracking-tight text-brand lg:text-2xl">
                Características completas
              </h2>
              <div className="mt-6 grid gap-8 md:grid-cols-3">
                <div>
                  <h3 className="text-[11px] font-black tracking-[0.16em] text-accent uppercase">
                    Generales
                  </h3>
                  <ul className="mt-3 grid gap-2 text-sm">
                    {detailRows.map((row) => (
                      <li
                        key={row.label}
                        className="flex justify-between gap-3 border-b border-edge/70 pb-2"
                      >
                        <span className="text-muted">{row.label}</span>
                        <strong className="text-right text-ink">{row.value}</strong>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-[11px] font-black tracking-[0.16em] text-accent uppercase">
                    Amenidades
                  </h3>
                  <ul className="mt-3 grid gap-2 text-sm text-muted">
                    {amenitiesA.length > 0 ? (
                      amenitiesA.map((amenity) => (
                        <li key={amenity} className="flex items-start gap-2">
                          <CheckIcon className="mt-0.5 size-3.5 shrink-0 text-success" />
                          {humanize(amenity)}
                        </li>
                      ))
                    ) : (
                      <li className="text-xs">Sin amenidades registradas.</li>
                    )}
                  </ul>
                </div>

                <div className="grid gap-8">
                  {amenitiesB.length > 0 ? (
                    <div>
                      <h3 className="text-[11px] font-black tracking-[0.16em] text-accent uppercase">
                        Servicios
                      </h3>
                      <ul className="mt-3 grid gap-2 text-sm text-muted">
                        {amenitiesB.map((amenity) => (
                          <li key={amenity} className="flex items-start gap-2">
                            <CheckIcon className="mt-0.5 size-3.5 shrink-0 text-success" />
                            {humanize(amenity)}
                          </li>
                        ))}
                        {project.services.map((service) => (
                          <li key={service} className="flex items-start gap-2">
                            <CheckIcon className="mt-0.5 size-3.5 shrink-0 text-success" />
                            {humanize(service)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  {project.certifications.length > 0 ? (
                    <div>
                      <h3 className="text-[11px] font-black tracking-[0.16em] text-accent uppercase">
                        Certificaciones
                      </h3>
                      <ul className="mt-3 grid gap-2 text-sm text-muted">
                        {project.certifications.map((item) => (
                          <li key={item} className="flex items-start gap-2">
                            <CheckIcon className="mt-0.5 size-3.5 shrink-0 text-success" />
                            {humanize(item)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  {project.financing.length > 0 ? (
                    <div>
                      <h3 className="text-[11px] font-black tracking-[0.16em] text-accent uppercase">
                        Financiamiento
                      </h3>
                      <ul className="mt-3 grid gap-2 text-sm text-muted">
                        {project.financing.map((item) => (
                          <li key={item} className="flex items-start gap-2">
                            <CheckIcon className="mt-0.5 size-3.5 shrink-0 text-success" />
                            {humanize(item)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              </div>
            </section>
          ) : null}

          {project.lots.length > 0 ? (
            <section className="mt-9">
              <h2 className="font-display text-xl font-black tracking-tight text-brand lg:text-2xl">
                Lotes disponibles
              </h2>
              <div className="mt-4 overflow-x-auto rounded-card border border-edge bg-surface shadow-[var(--shadow-card)]">
                <table className="w-full min-w-[520px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-edge text-[11px] font-black tracking-[0.14em] text-muted uppercase">
                      <th className="px-5 py-3">Lote</th>
                      <th className="px-5 py-3">Área</th>
                      <th className="px-5 py-3">Precio</th>
                      <th className="px-5 py-3">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {project.lots.map((lot) => (
                      <tr key={lot.id} className="border-b border-edge/60 last:border-0">
                        <td className="px-5 py-3 font-bold text-ink">
                          {lot.lotNumber}
                          {lot.block ? <span className="text-muted"> · {lot.block}</span> : null}
                        </td>
                        <td className="px-5 py-3 text-muted">{lot.areaM2} m²</td>
                        <td className="px-5 py-3 font-semibold text-ink">
                          {formatPrice(lot.price, CURRENCY_FALLBACK[project.currency] ?? "PEN")}
                        </td>
                        <td className="px-5 py-3">
                          <span
                            className={cn(
                              "rounded-full px-2.5 py-1 text-[11px] font-bold",
                              lot.status === "AVAILABLE" && "bg-success/10 text-success",
                              lot.status === "RESERVED" && "bg-warning/10 text-warning",
                              lot.status === "SOLD" && "bg-ink/10 text-muted",
                            )}
                          >
                            {LOT_STATUS_LABEL[lot.status] ?? humanize(lot.status)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ) : null}

          {project.milestones.length > 0 ? (
            <section className="mt-9">
              <h2 className="font-display text-xl font-black tracking-tight text-brand lg:text-2xl">
                Cronograma
              </h2>
              <ol className="mt-4 grid gap-3">
                {project.milestones.map((milestone) => (
                  <li
                    key={milestone.id}
                    className="flex items-start gap-3 rounded-card border border-edge bg-surface p-4 shadow-[var(--shadow-card)]"
                  >
                    <CalendarIcon className="mt-0.5 size-4 shrink-0 text-brand" />
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-ink">{milestone.title}</p>
                      <p className="text-xs text-muted">{formatMonthYear(milestone.date)}</p>
                      {milestone.note ? (
                        <p className="mt-1 text-sm text-muted">{milestone.note}</p>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          ) : null}

          {plans.length > 0 ? (
            <section className="mt-9">
              <h2 className="font-display text-xl font-black tracking-tight text-brand lg:text-2xl">
                Planos
              </h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {plans.map((plan) => (
                  <li key={plan.id}>
                    <a
                      href={plan.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between gap-3 rounded-card border border-edge bg-surface p-4 text-sm font-bold text-ink transition-colors hover:border-brand"
                    >
                      Ver plano
                      <ArrowRightIcon className="size-4 text-brand" />
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {renders.length > 0 ? (
            <section className="mt-9">
              <h2 className="font-display text-xl font-black tracking-tight text-brand lg:text-2xl">
                Renders
              </h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {renders.map((render) => (
                  <li
                    key={render.id}
                    className="overflow-hidden rounded-card border border-edge bg-surface shadow-[var(--shadow-card)]"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={render.url}
                      alt="Render del proyecto"
                      loading="lazy"
                      className="h-48 w-full object-cover"
                    />
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <section className="mt-9 overflow-hidden rounded-card border border-edge bg-surface shadow-[var(--shadow-card)]">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-edge p-5 sm:px-7 sm:py-5">
              <div className="min-w-0">
                <h2 className="font-display text-xl font-black tracking-tight text-brand lg:text-2xl">
                  Ubicación
                </h2>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
                  <PinIcon className="size-4 shrink-0" />
                  <span className="line-clamp-1">{locationLine}</span>
                </p>
              </div>
              {hasCoords ? (
                <a
                  href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=17/${lat}/${lng}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-10 items-center gap-2 rounded-card border border-edge px-4 text-xs font-bold text-brand transition-colors hover:border-brand"
                >
                  Abrir en el mapa
                  <ArrowRightIcon className="size-3.5" />
                </a>
              ) : null}
            </div>

            <div className="p-5 sm:p-7">
              {hasCoords ? (
                <LazyPropertyLocationMap
                  latitude={lat}
                  longitude={lng}
                  label={project.name}
                  zoom={15}
                  className="h-80 w-full sm:h-[420px] lg:h-[480px]"
                />
              ) : (
                <div className="flex h-60 flex-col items-center justify-center gap-2 rounded-card border border-dashed border-edge bg-surface-muted text-sm font-semibold text-muted lg:h-80">
                  <PinIcon className="size-6 text-brand" />
                  Ubicación aproximada disponible por distrito
                </div>
              )}
            </div>
          </section>

          {/* Preguntas rapidas: al final, despues del mapa. Abren un modal que
              lleva al WhatsApp del anunciante. Misma logica que en propiedades. */}
          <QuickQuestions
            propertyTitle={project.name}
            agentName={project.agent.name}
            whatsappDigits={whatsappDigits}
            context="project"
          />
        </main>

        <aside className="flex flex-col gap-4 lg:sticky lg:top-20">
          <div className="rounded-2xl border border-edge bg-surface p-5 xl:p-6">
            <h2 className="text-base font-bold text-ink xl:text-lg">Contacta al desarrollador</h2>
            <LeadForm
              projectId={project.id}
              source="PROJECT_FORM"
              compact
              whatsappUrl={whatsappUrl}
              defaultMessage={`¡Hola! Quiero que se comuniquen conmigo para recibir más información sobre el proyecto ${project.name} que vi en ARIZ.`}
            />
          </div>

          {project.agent.id ? (
            <Link
              href={`/agentes/${project.agent.id}`}
              aria-label={`Ver perfil de ${project.agent.name}`}
              className="flex items-center gap-4 rounded-2xl border border-edge bg-surface p-5 transition-colors hover:border-brand"
            >
              <span className="flex h-14 w-24 shrink-0 items-center justify-center rounded-md bg-brand font-display text-2xl font-black text-accent">
                {project.agent.name.charAt(0).toUpperCase()}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-bold text-ink uppercase">
                  {project.agent.name}
                </span>
                <span className="block truncate text-xs text-muted">{agentTypeLabel}</span>
                {project.agent.status === "APPROVED" ? (
                  <span className="mt-1 flex items-center gap-1 text-xs font-bold text-success">
                    <CheckIcon className="size-3.5" />
                    Verificado por ARIZ
                  </span>
                ) : null}
              </span>
              <span className="shrink-0 text-sm font-bold text-ink">Ver perfil</span>
            </Link>
          ) : (
            <div className="flex items-center gap-4 rounded-2xl border border-edge bg-surface p-5">
              <span className="flex h-14 w-24 shrink-0 items-center justify-center rounded-md bg-brand font-display text-2xl font-black text-accent">
                AR
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-bold text-ink uppercase">{project.agent.name}</span>
                <span className="block truncate text-xs text-muted">{agentTypeLabel}</span>
                <span className="mt-1 flex items-center gap-1 text-xs font-bold text-success">
                  <CheckIcon className="size-3.5" />
                  Publicado por ARIZ
                </span>
              </span>
            </div>
          )}
        </aside>
      </div>
    </Container>
  );
}
