import Link from "next/link";
import type { ComponentType, SVGProps } from "react";
import {
  ArrowRightIcon,
  BellIcon,
  ChatIcon,
  Container,
  HeartIcon,
  SlidersIcon,
} from "@/shared/ui";
import { ROUTES } from "@/shared/config/routes";
import { formatPrice } from "@/shared/lib/format";
import { getPublicProjectsServer } from "@/features/projects/api/server";
import { toProjectCardModel } from "@/features/projects/lib/project-card";
import { AccountProjectMapPreview } from "@/features/home/components/account-project-map-preview";
import type { MapPoint } from "@/features/listings/components/listings-map";

type IconType = ComponentType<SVGProps<SVGSVGElement>>;

interface Feature {
  key: string;
  title: string;
  description: string;
  icon: IconType;
}

const FEATURES: readonly Feature[] = [
  {
    key: "precisas",
    title: "Busquedas mas precisas",
    description: "Aplica filtros y encuentra propiedades que realmente encajan contigo.",
    icon: SlidersIcon,
  },
  {
    key: "favoritos",
    title: "Favoritos organizados",
    description: "Guarda inmuebles y vuelve a consultarlos cuando quieras.",
    icon: HeartIcon,
  },
  {
    key: "alertas",
    title: "Alertas personalizadas",
    description: "Conoce nuevas oportunidades segun ubicacion, tipo y presupuesto.",
    icon: BellIcon,
  },
  {
    key: "contacto",
    title: "Contacto directo",
    description: "Consulta propiedades y proyectos desde tu cuenta.",
    icon: ChatIcon,
  },
];

export async function AccountCtaSection() {
  const projectPoints: MapPoint[] = await getPublicProjectsServer(20)
    .then(({ items }) =>
      items
        .map(toProjectCardModel)
        .flatMap((project): MapPoint[] => {
          const { lat, lng } = project.location;
          if (lat == null || lng == null || !Number.isFinite(lat) || !Number.isFinite(lng)) {
            return [];
          }

          return [{
            id: project.id,
            lat,
            lng,
            priceLabel: `Desde ${formatPrice(project.startingPrice.amount, project.startingPrice.currency)}`,
            title: project.name,
            districtLabel: `${project.location.district}, ${project.location.department}`,
            coverImage: project.images[0],
            href: ROUTES.project(project.slug),
            badge: project.deliveryStage,
            publishedAt: project.publishedAt,
          }];
        }),
    )
    .catch(() => []);

  return (
    <section className="relative -mt-1 overflow-hidden bg-brand-soft pt-8 pb-12 sm:pt-10 sm:pb-16">
      <Container size="wide-tight" className="relative grid items-center gap-10 lg:grid-cols-[1fr_420px] lg:gap-14 xl:gap-20">
        <div>
          <p className="text-[11px] font-black tracking-[0.18em] text-accent uppercase">
            Tu busqueda, siempre contigo
          </p>
          <h2 className="mt-3 max-w-3xl text-2xl leading-tight font-black tracking-tight text-[#071A5A] sm:text-3xl lg:text-4xl">
            Encuentra tu proximo espacio sin perder ninguna oportunidad
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted sm:text-base">
            Crea una cuenta gratuita y organiza toda tu busqueda inmobiliaria desde un solo lugar.
          </p>

          <ul className="mt-8 grid gap-x-8 gap-y-7 sm:grid-cols-2 xl:gap-x-12">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;

              return (
                <li key={feature.key} className="flex gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-[6px] bg-white text-brand shadow-[var(--shadow-card)]">
                    <Icon className="size-[18px]" />
                  </span>
                  <div>
                    <h3 className="text-sm font-black text-brand">{feature.title}</h3>
                    <p className="mt-1 text-[13px] leading-relaxed text-muted">{feature.description}</p>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="mt-9 flex gap-2 sm:gap-3">
            <Link
              href={ROUTES.registerCustomer}
              className="flex h-11 min-w-0 flex-1 items-center justify-center gap-1 rounded-[6px] bg-brand px-1.5 text-[10px] font-black whitespace-nowrap text-on-brand transition-colors hover:bg-brand-hover min-[360px]:px-2 min-[360px]:text-[11px] sm:flex-none sm:gap-2 sm:px-6 sm:text-sm"
            >
              Crear cuenta gratuita
              <ArrowRightIcon className="size-3.5 shrink-0 sm:size-4" />
            </Link>
            <Link
              href={ROUTES.services}
              className="flex h-11 min-w-0 flex-1 items-center justify-center rounded-[6px] border border-edge bg-white px-3 text-xs font-black whitespace-nowrap text-brand transition-colors hover:border-brand sm:flex-none sm:px-6 sm:text-sm"
            >
              Conócenos
            </Link>
          </div>
        </div>

        <AccountProjectMapPreview points={projectPoints} href={ROUTES.projects} />
      </Container>
    </section>
  );
}
