import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { buildServiceWhatsappUrl } from "@/features/services/config";
import { getPublicInvestmentOpportunity } from "@/features/investment-opportunities/api/server";
import {
  INVESTMENT_GOAL_LABELS,
  INVESTMENT_RISK_LABELS,
  INVESTMENT_STATUS_LABELS,
} from "@/features/investment-opportunities/types";
import { ListingsMap, type MapPoint } from "@/features/listings/components/listings-map";
import { ArrowRightIcon, ChartIcon, PinIcon, RulerIcon, WhatsappIcon } from "@/shared/ui";

const formatMoney = (value: number) =>
  new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    maximumFractionDigits: 0,
  }).format(value);

export default async function InvestmentOpportunityPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let opportunity;
  try {
    opportunity = await getPublicInvestmentOpportunity(slug);
  } catch (error) {
    if (error instanceof Error && error.message.includes("(404)")) notFound();
    throw error;
  }

  const point: MapPoint = {
    id: opportunity.id,
    lat: opportunity.latitude,
    lng: opportunity.longitude,
    title: opportunity.name,
    priceLabel: `Desde ${formatMoney(opportunity.initialInvestment)}`,
    districtLabel: `${opportunity.district}, ${opportunity.department}`,
    coverImage: opportunity.coverImageUrl,
    href: `/inversiones/${opportunity.slug}`,
  };

  return (
    <main className="bg-canvas">
      <section className="mx-auto grid w-full max-w-[105rem] gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:px-8 xl:px-10">
        <div className="min-w-0">
          <Link href="/inversiones" className="inline-flex items-center gap-2 text-sm font-bold text-brand">
            <ArrowRightIcon className="size-4 rotate-180" />
            Volver a oportunidades
          </Link>
          <div className="relative mt-5 aspect-[16/9] overflow-hidden rounded-2xl bg-surface-muted">
            <Image src={opportunity.coverImageUrl} alt={opportunity.name} fill priority sizes="(min-width: 1024px) 65vw, 100vw" className="object-cover" />
          </div>
          {opportunity.galleryImages.length ? (
            <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4">
              {opportunity.galleryImages.map((image, index) => (
                <div key={`${image}-${index}`} className="relative aspect-[4/3] overflow-hidden rounded-xl bg-surface-muted">
                  <Image src={image} alt={`${opportunity.name}, imagen ${index + 1}`} fill sizes="25vw" className="object-cover" />
                </div>
              ))}
            </div>
          ) : null}
          <div className="mt-7">
            <p className="text-xs font-black tracking-[0.16em] text-accent uppercase">Oportunidad de inversión · {INVESTMENT_GOAL_LABELS[opportunity.investmentGoal]}</p>
            <h1 className="mt-2 font-display text-3xl font-black tracking-tight text-brand sm:text-4xl">{opportunity.name}</h1>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-black text-brand">
                {opportunity.investmentType?.name ?? opportunity.investmentKind}
              </span>
              <span className="rounded-full bg-accent px-3 py-1 text-xs font-black text-on-accent">
                {INVESTMENT_STATUS_LABELS[opportunity.status]}
              </span>
              {opportunity.riskLevel ? (
                <span className="rounded-full bg-surface-muted px-3 py-1 text-xs font-bold text-muted">
                  Riesgo {INVESTMENT_RISK_LABELS[opportunity.riskLevel]}
                </span>
              ) : null}
            </div>
            <p className="mt-3 flex items-center gap-2 text-sm font-bold text-muted">
              <PinIcon className="size-4 text-accent" />
              {opportunity.location}
            </p>
            <p className="mt-5 text-base leading-7 text-ink">{opportunity.summary}</p>
            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              <InvestmentMetric Icon={ChartIcon} label="Inversión inicial" value={`Desde ${formatMoney(opportunity.initialInvestment)}`} />
              <InvestmentMetric Icon={ChartIcon} label="ROI estimado" value={`${opportunity.roiPercent}%`} />
              <InvestmentMetric Icon={RulerIcon} label="Metraje" value={opportunity.areaLabel} />
            </div>
            <section className="mt-8">
              <h2 className="text-xl font-black text-brand">Sobre esta inversión</h2>
              <p className="mt-3 whitespace-pre-line text-sm leading-7 text-muted">{opportunity.description}</p>
            </section>
            {opportunity.highlights.length ? (
              <section className="mt-8 rounded-2xl border border-edge bg-surface p-5">
                <h2 className="text-lg font-black text-brand">Puntos destacados</h2>
                <ul className="mt-3 grid gap-3 sm:grid-cols-2">
                  {opportunity.highlights.map((highlight) => (
                    <li key={highlight} className="flex gap-2 text-sm leading-6 text-ink">
                      <span className="mt-2 size-2 shrink-0 rounded-full bg-accent" />
                      {highlight}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </div>
        </div>
        <aside className="flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-edge bg-surface p-5 shadow-[var(--shadow-card)]">
            <h2 className="text-lg font-black text-brand">Ubicación del proyecto</h2>
            <p className="mt-1 text-sm text-muted">{opportunity.district}, {opportunity.province}, {opportunity.department}</p>
            <div className="mt-4 h-72 overflow-hidden rounded-xl">
              <ListingsMap points={[point]} center={[opportunity.latitude, opportunity.longitude]} zoom={15} interactive={false} />
            </div>
            <a
              href={`https://www.google.com/maps?q=${opportunity.latitude},${opportunity.longitude}`}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex text-sm font-bold text-brand underline"
            >
              Abrir ubicación exacta
            </a>
          </div>
          <div className="rounded-2xl bg-brand p-5 text-white shadow-[var(--shadow-card)]">
            <p className="text-sm font-bold text-white/75">¿Quieres conocer más?</p>
            <a
              href={buildServiceWhatsappUrl(`información del proyecto de inversión ${opportunity.name}`)}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#25d366] px-4 text-sm font-black text-white transition hover:bg-[#1fb857]"
            >
              <WhatsappIcon className="size-5" />
              {opportunity.ctaLabel || "Consultar por WhatsApp"}
            </a>
            <p className="mt-3 text-xs leading-5 text-white/70">El ROI publicado es referencial. Solicita a un asesor los detalles y condiciones vigentes.</p>
          </div>
        </aside>
      </section>
    </main>
  );
}

function InvestmentMetric({
  Icon,
  label,
  value,
}: {
  Icon: typeof ChartIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-edge bg-surface p-4">
      <Icon className="size-5 text-accent" />
      <p className="mt-3 text-xs font-bold text-muted">{label}</p>
      <p className="mt-1 text-base font-black text-brand">{value}</p>
    </div>
  );
}
