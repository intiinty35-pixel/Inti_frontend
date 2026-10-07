"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRightIcon,
  CalendarIcon,
  ChartIcon,
  CheckCircleIcon,
  PinIcon,
  RulerIcon,
  SparkleIcon,
  WhatsappIcon,
} from "@/shared/ui";
import { buildServiceWhatsappUrl } from "@/features/services/config";
import {
  INVESTMENT_GOAL_LABELS,
  INVESTMENT_RISK_LABELS,
  INVESTMENT_STATUS_LABELS,
  type InvestmentOpportunity,
  type InvestmentType,
} from "@/features/investment-opportunities/types";

const goals = [
  { value: "plusvalia", label: "Plusvalia" },
  { value: "construccion", label: "Construccion" },
  { value: "renta", label: "Renta futura" },
];

const formatMoney = (value: number) =>
  new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    maximumFractionDigits: 0,
  }).format(value);

export function InvestmentsExperience({
  opportunities,
  investmentTypes,
  loadError,
}: {
  opportunities: InvestmentOpportunity[];
  investmentTypes: InvestmentType[];
  loadError?: string;
}) {
  const [capital, setCapital] = useState(50000);
  const [term, setTerm] = useState(24);
  const [goal, setGoal] = useState("plusvalia");
  const [selectedTypeId, setSelectedTypeId] = useState<string | null>(null);

  const visibleOpportunities = useMemo(
    () =>
      selectedTypeId
        ? opportunities.filter((item) => item.investmentTypeId === selectedTypeId)
        : opportunities,
    [opportunities, selectedTypeId],
  );
  const selectedType = useMemo(
    () => investmentTypes.find((type) => type.id === selectedTypeId) ?? null,
    [investmentTypes, selectedTypeId],
  );

  const compatible = useMemo(
    () =>
      visibleOpportunities.filter(
        (item) =>
          capital >= item.initialInvestment &&
          (item.investmentGoal === goal || capital >= 20000),
      ),
    [capital, goal, visibleOpportunities],
  );

  const averageRoi = compatible.length
    ? compatible.reduce((sum, item) => sum + item.roiPercent, 0) / compatible.length
    : 14;
  const estimatedReturn = Math.round(capital * (averageRoi / 100) * (term / 12));
  const whatsappUrl = buildServiceWhatsappUrl("inversion inmobiliaria");

  return (
    <main className="bg-canvas">
      <section className="relative overflow-hidden bg-brand px-4 pb-12 pt-28 text-white sm:px-6 lg:px-8 xl:px-10">
        <Image
          src="/inversione/image.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
          aria-hidden
        />
        <div className="absolute inset-x-0 top-0 h-[72%] bg-gradient-to-b from-brand/80 via-brand/42 to-transparent" aria-hidden />
        <div className="absolute inset-y-0 left-0 w-full bg-gradient-to-r from-brand/82 via-brand/45 to-transparent" aria-hidden />
        <div className="absolute inset-x-0 bottom-0 h-1 bg-accent" aria-hidden />
        <div className="relative mx-auto flex w-full max-w-[105rem]">
          <div>
            <h1 className="mt-4 max-w-4xl font-display text-4xl font-black leading-tight tracking-tight sm:text-6xl">
              Invierte en oportunidades inmobiliarias con criterio y respaldo
            </h1>
            <p className="mt-5 max-w-2xl text-sm font-semibold leading-7 text-white/78 sm:text-base">
              Evalúa tu capital, identifica oportunidades compatibles y conversa con un asesor
              para evaluar la mejor ruta de inversion.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="#oportunidades"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-card bg-accent px-5 text-sm font-black text-on-accent transition-colors hover:bg-accent-hover"
              >
                Ver oportunidades
                <ArrowRightIcon className="size-4" />
              </Link>
              <Link
                href={whatsappUrl}
                target="_blank"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-card border border-white/20 bg-white/10 px-5 text-sm font-black text-white transition-colors hover:bg-white/15"
              >
                <WhatsappIcon className="size-4" />
                Hablar con un asesor
              </Link>
            </div>
          </div>

        </div>
      </section>

      <section id="oportunidades" className="px-4 py-10 sm:px-6 lg:px-8 xl:px-10">
        <div className="mx-auto grid w-full max-w-[105rem] gap-7 xl:grid-cols-[400px_minmax(0,1fr)]">
          <aside className="h-fit rounded-card border border-edge bg-surface p-5 shadow-[var(--shadow-card)] xl:sticky xl:top-24">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.16em] text-accent">
                  Evaluador
                </p>
                <h2 className="mt-2 text-2xl font-black text-brand">Calculadora de inversion</h2>
              </div>
              <span className="flex size-11 items-center justify-center rounded-card bg-brand-soft text-brand">
                <ChartIcon className="size-6" />
              </span>
            </div>

            <SimulatorRange
              label="Capital disponible"
              value={formatMoney(capital)}
              min={3000}
              max={200000}
              step={1000}
              rawValue={capital}
              onChange={setCapital}
            />
            <SimulatorRange
              label="Plazo deseado"
              value={`${term} meses`}
              min={6}
              max={48}
              step={6}
              rawValue={term}
              onChange={setTerm}
            />

            <div className="mt-6">
              <p className="text-sm font-black text-brand">Objetivo</p>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {goals.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setGoal(item.value)}
                    className={`h-10 rounded-card border px-2 text-xs font-black transition ${
                      goal === item.value
                        ? "border-accent bg-accent text-on-accent"
                        : "border-edge bg-canvas text-brand hover:border-accent"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 rounded-card bg-brand p-5 text-white">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-accent">
                Retorno estimado
              </p>
              <p className="mt-2 font-display text-4xl font-black">{formatMoney(estimatedReturn)}</p>
              <p className="mt-3 text-xs font-semibold leading-5 text-white/75">
                Calculo referencial segun el plazo y las oportunidades compatibles.
              </p>
            </div>
          </aside>

          <div className="min-w-0">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.16em] text-accent">
                  Catalogo exclusivo
                </p>
                <h2 className="mt-2 text-3xl font-black tracking-tight text-brand">
                  Oportunidades de inversion
                </h2>
              </div>
              <Link
                href={whatsappUrl}
                target="_blank"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-card bg-brand px-4 text-sm font-black text-on-brand transition hover:bg-brand-hover"
              >
                <WhatsappIcon className="size-5" />
                Solicitar asesoria
              </Link>
            </div>

            {investmentTypes.length ? (
              <section className="mt-6 rounded-card border border-edge bg-surface p-4 shadow-[var(--shadow-card)]">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.16em] text-accent">
                      Tipos de inversión
                    </p>
                    <h3 className="mt-1 text-lg font-black text-brand">
                      Elige una categoría
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedTypeId(null)}
                    className={`h-9 rounded-card px-3 text-xs font-black transition ${
                      selectedTypeId === null
                        ? "bg-brand text-on-brand"
                        : "border border-edge bg-white text-brand hover:border-brand"
                    }`}
                  >
                    Todas
                  </button>
                </div>
                <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                  {investmentTypes.map((type) => {
                    const total = opportunities.filter((item) => item.investmentTypeId === type.id).length;
                    const active = selectedTypeId === type.id;

                    return (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setSelectedTypeId(type.id)}
                        className={`min-h-20 rounded-card border p-3 text-left transition ${
                          active
                            ? "border-brand bg-brand text-on-brand shadow-[var(--shadow-card)]"
                            : "border-edge bg-white text-ink hover:border-brand hover:bg-brand/5"
                        }`}
                      >
                        <span className={`block text-sm font-black leading-tight ${active ? "text-on-brand" : "text-brand"}`}>
                          {type.name}
                        </span>
                        <span className={`mt-1 line-clamp-2 block text-xs leading-5 ${active ? "text-white/75" : "text-muted"}`}>
                          {type.description || `${total} oportunidades disponibles`}
                        </span>
                      </button>
                    );
                  })}
                </div>
                {selectedType ? (
                  <InvestmentTypeGuide
                    type={selectedType}
                    opportunities={visibleOpportunities}
                    onSkip={() => setSelectedTypeId(null)}
                    whatsappUrl={whatsappUrl}
                  />
                ) : null}
              </section>
            ) : null}

            {loadError ? (
              <p role="alert" className="mt-5 rounded-card border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                {loadError}
              </p>
            ) : null}

            <div className="mt-6 grid gap-5 lg:grid-cols-2 2xl:grid-cols-3">
              {visibleOpportunities.map((item) => (
                <InvestmentCard
                  key={item.id}
                  item={item}
                  whatsappUrl={whatsappUrl}
                  compatible={compatible.some((match) => match.id === item.id)}
                />
              ))}
            </div>

            {!loadError && visibleOpportunities.length === 0 ? (
              <p className="mt-5 rounded-card border border-dashed border-edge bg-surface p-8 text-center text-sm text-muted">
                No hay oportunidades publicadas para este tipo de inversion.
              </p>
            ) : null}
          </div>
        </div>
      </section>
    </main>
  );
}

function SimulatorRange({
  label,
  value,
  rawValue,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: string;
  rawValue: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="mt-6 block text-sm font-black text-brand">
      {label}
      <span className="mt-2 block font-display text-3xl font-black">{value}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={rawValue}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-3 w-full accent-[var(--accent)]"
      />
    </label>
  );
}

function InvestmentTypeGuide({
  type,
  opportunities,
  onSkip,
  whatsappUrl,
}: {
  type: InvestmentType;
  opportunities: InvestmentOpportunity[];
  onSkip: () => void;
  whatsappUrl: string;
}) {
  const minimumInvestment = opportunities.length
    ? Math.min(...opportunities.map((item) => item.initialInvestment))
    : null;
  const averageRoi = opportunities.length
    ? opportunities.reduce((sum, item) => sum + item.roiPercent, 0) / opportunities.length
    : null;
  const terms = opportunities
    .map((item) => item.estimatedTermMonths)
    .filter((value): value is number => typeof value === "number" && value > 0);
  const shortestTerm = terms.length ? Math.min(...terms) : null;
  const explanation = getInvestmentTypeExplanation(type.name, type.description);

  return (
    <div className="mt-4 overflow-hidden rounded-card border border-brand/15 bg-brand/[0.04]">
      <div className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_260px]">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-accent">
            Cómo funciona
          </p>
          <h4 className="mt-1 text-xl font-black text-brand">{type.name}</h4>
          <p className="mt-2 text-sm font-semibold leading-6 text-muted">
            {explanation.intro}
          </p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {explanation.points.map((point) => (
              <div key={point.title} className="rounded-card bg-white p-3">
                <p className="text-xs font-black text-brand">{point.title}</p>
                <p className="mt-1 text-xs leading-5 text-muted">{point.text}</p>
              </div>
            ))}
          </div>
        </div>

        <aside className="rounded-card bg-white p-3">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-muted">
            Resumen del tipo
          </p>
          <div className="mt-3 grid gap-2">
            <MiniStat label="Oportunidades" value={`${opportunities.length}`} />
            <MiniStat
              label="Desde"
              value={minimumInvestment ? formatMoney(minimumInvestment) : "A consultar"}
            />
            <MiniStat
              label="Retorno ref."
              value={averageRoi ? `${averageRoi.toFixed(0)}%` : "A consultar"}
            />
            <MiniStat
              label="Plazo"
              value={shortestTerm ? `Desde ${shortestTerm} meses` : "A consultar"}
            />
          </div>
          <div className="mt-4 grid gap-2">
            <Link
              href={whatsappUrl}
              target="_blank"
              className="inline-flex h-9 items-center justify-center gap-2 rounded-card bg-brand px-3 text-xs font-black text-on-brand transition hover:bg-brand-hover"
            >
              <WhatsappIcon className="size-4" />
              Quiero información
            </Link>
            <button
              type="button"
              onClick={onSkip}
              className="h-9 rounded-card border border-edge bg-white px-3 text-xs font-black text-brand transition hover:border-brand hover:bg-brand/5"
            >
              Omitir
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-card bg-canvas px-3 py-2">
      <span className="text-[11px] font-bold text-muted">{label}</span>
      <span className="text-xs font-black text-brand">{value}</span>
    </div>
  );
}

function getInvestmentTypeExplanation(name: string, description: string | null) {
  const normalized = name.toLowerCase();
  const intro =
    description ||
    "Esta categoría agrupa oportunidades que pueden generar valor según la ubicación, el momento de entrada y la estrategia comercial del proyecto.";

  if (normalized.includes("terreno")) {
    return {
      intro,
      points: [
        {
          title: "Cómo se invierte",
          text: "Se ingresa a una oportunidad ligada a suelo con potencial urbano, comercial o de desarrollo.",
        },
        {
          title: "Cómo se gana",
          text: "La ganancia puede venir por valorización del terreno, venta futura o desarrollo del activo.",
        },
      ],
    };
  }

  if (normalized.includes("departamento")) {
    return {
      intro,
      points: [
        {
          title: "Cómo se invierte",
          text: "Se evalúan unidades con precio, ubicación y demanda orientadas a renta o reventa.",
        },
        {
          title: "Cómo se gana",
          text: "El retorno puede venir por alquiler, plusvalía o venta en una etapa de mayor valor.",
        },
      ],
    };
  }

  if (normalized.includes("preventa")) {
    return {
      intro,
      points: [
        {
          title: "Cómo se invierte",
          text: "Se entra temprano a una oportunidad con condiciones preferentes antes de su etapa final.",
        },
        {
          title: "Cómo se gana",
          text: "El margen puede crecer cuando el proyecto avanza y el precio comercial sube.",
        },
      ],
    };
  }

  if (normalized.includes("particip")) {
    return {
      intro,
      points: [
        {
          title: "Cómo se invierte",
          text: "Se participa en una estructura del proyecto según condiciones, monto y plazo definidos.",
        },
        {
          title: "Cómo se gana",
          text: "El retorno depende del desempeño comercial, la salida pactada y la rentabilidad del proyecto.",
        },
      ],
    };
  }

  return {
    intro,
    points: [
      {
        title: "Cómo se invierte",
        text: "Se revisa la oportunidad, el monto mínimo, el plazo y la documentación antes de tomar una decisión.",
      },
      {
        title: "Cómo se gana",
        text: "El retorno puede venir por plusvalía, venta, renta o participación en el resultado del proyecto.",
      },
    ],
  };
}

function InvestmentCard({
  item,
  whatsappUrl,
  compatible,
}: {
  item: InvestmentOpportunity;
  whatsappUrl: string;
  compatible: boolean;
}) {
  return (
    <article className="group overflow-hidden rounded-card border border-edge bg-surface shadow-[var(--shadow-card)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-pop)]">
      <Link
        href={`/inversiones/${item.slug}`}
        aria-label={`Ver oportunidad ${item.name}`}
        className="relative block aspect-[16/8] bg-surface-muted"
      >
        <Image
          src={item.coverImageUrl}
          alt={item.name}
          fill
          sizes="(min-width: 1280px) 28vw, (min-width: 1024px) 45vw, 100vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <span className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-brand/75 to-transparent" />
        <span className="absolute left-3 top-3 rounded-full bg-accent px-2.5 py-1 text-[11px] font-black text-on-accent">
          {item.estimatedReturnLabel ?? `${item.roiPercent}% ROI`}
        </span>
        <span className="absolute right-3 top-3 rounded-full bg-white/92 px-2.5 py-1 text-[11px] font-black text-brand">
          {INVESTMENT_STATUS_LABELS[item.status]}
        </span>
        {compatible ? (
          <span className="absolute bottom-3 left-3 rounded-full bg-white/92 px-2.5 py-1 text-[11px] font-black text-brand">
            Compatible con tu capital
          </span>
        ) : null}
      </Link>

      <div className="p-4">
        <p className="text-[11px] font-black uppercase tracking-[0.16em] text-accent">
          {item.investmentType?.name ?? item.investmentKind}
        </p>
        <h3 className="line-clamp-2 text-lg font-black leading-tight text-brand">{item.name}</h3>
        <p className="mt-1.5 flex items-center gap-1.5 text-xs font-bold text-muted">
          <PinIcon className="size-4 text-accent" />
          <span className="truncate">{item.location}</span>
        </p>
        <p className="mt-2 line-clamp-2 text-sm leading-5 text-muted">{item.summary}</p>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <OpportunityMetric Icon={RulerIcon} label="Metraje" value={item.areaLabel} />
          <OpportunityMetric Icon={ChartIcon} label="Inicial desde" value={formatMoney(item.initialInvestment)} />
          <OpportunityMetric Icon={CalendarIcon} label="Plazo" value={item.estimatedTermMonths ? `${item.estimatedTermMonths} meses` : INVESTMENT_GOAL_LABELS[item.investmentGoal]} />
          <OpportunityMetric Icon={SparkleIcon} label={item.riskLevel ? "Riesgo" : "Activo"} value={item.riskLevel ? INVESTMENT_RISK_LABELS[item.riskLevel] : item.assetType} />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <Link
            href={`/inversiones/${item.slug}`}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-card bg-brand px-3 text-xs font-black text-on-brand transition hover:bg-brand-hover"
          >
            Detalle
            <ArrowRightIcon className="size-3.5" />
          </Link>
          <Link
            href={whatsappUrl}
            target="_blank"
            className="inline-flex h-9 items-center justify-center gap-2 rounded-card border border-edge px-3 text-xs font-black text-brand transition hover:border-accent hover:text-accent"
          >
            <WhatsappIcon className="size-4" />
            {item.ctaLabel || "Contacto"}
          </Link>
        </div>
      </div>
    </article>
  );
}

function OpportunityMetric({
  Icon,
  label,
  value,
}: {
  Icon: typeof ChartIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2 rounded-card bg-canvas px-2.5 py-2">
      <Icon className="size-4 shrink-0 text-accent" />
      <div className="min-w-0">
        <p className="text-[10px] font-bold text-muted">{label}</p>
        <p className="truncate text-sm font-black capitalize text-brand">{value}</p>
      </div>
    </div>
  );
}
