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
  type InvestmentOpportunity,
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
  loadError,
}: {
  opportunities: InvestmentOpportunity[];
  loadError?: string;
}) {
  const [capital, setCapital] = useState(50000);
  const [term, setTerm] = useState(24);
  const [goal, setGoal] = useState("plusvalia");

  const compatible = useMemo(
    () =>
      opportunities.filter(
        (item) =>
          capital >= item.initialInvestment &&
          (item.investmentGoal === goal || capital >= 20000),
      ),
    [capital, goal, opportunities],
  );

  const averageRoi = compatible.length
    ? compatible.reduce((sum, item) => sum + item.roiPercent, 0) / compatible.length
    : 14;
  const estimatedReturn = Math.round(capital * (averageRoi / 100) * (term / 12));
  const whatsappUrl = buildServiceWhatsappUrl("inversion inmobiliaria");

  return (
    <main className="bg-canvas">
      <section className="border-b border-edge bg-[#F3F4F8] px-4 py-8 sm:px-6 lg:px-8 xl:px-10">
        <div className="mx-auto grid w-full max-w-[105rem] gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
          <div>
            <p className="text-[11px] font-black tracking-[0.18em] text-accent uppercase">
              Ariz Invest Club
            </p>
            <h1 className="mt-3 max-w-3xl text-3xl leading-tight font-black tracking-tight text-[#071A5A] sm:text-5xl">
              Modulo de inversion inmobiliaria
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[#596273] sm:text-base">
              Revisa tu capacidad, calcula retornos estimados y encuentra oportunidades
              compatibles con tu objetivo de inversion.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <SummaryCard label="Valor simulado" value={formatMoney(capital)} Icon={ChartIcon} />
            <SummaryCard label="Inversiones activas" value={`${compatible.length}`} Icon={CheckCircleIcon} />
            <SummaryCard label="ROI estimado" value={`${averageRoi.toFixed(0)}%`} Icon={SparkleIcon} />
          </div>
        </div>
      </section>

      <section className="px-4 py-8 sm:px-6 lg:px-8 xl:px-10">
        <div className="mx-auto grid w-full max-w-[105rem] gap-6 xl:grid-cols-[420px_1fr]">
          <aside className="rounded-[8px] border border-edge bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-black tracking-[0.16em] text-accent uppercase">
                  Simulador
                </p>
                <h2 className="mt-2 text-xl font-black text-[#071A5A]">Calculadora de inversion</h2>
              </div>
              <ChartIcon className="size-8 text-accent" />
            </div>

            <label className="mt-6 block text-sm font-black text-[#071A5A]">
              Capital disponible
              <span className="mt-2 block text-2xl">{formatMoney(capital)}</span>
            </label>
            <input
              type="range"
              min={3000}
              max={200000}
              step={1000}
              value={capital}
              onChange={(event) => setCapital(Number(event.target.value))}
              className="mt-3 w-full accent-[#F5B700]"
            />

            <label className="mt-6 block text-sm font-black text-[#071A5A]">
              Plazo deseado
              <span className="mt-2 block text-2xl">{term} meses</span>
            </label>
            <input
              type="range"
              min={6}
              max={48}
              step={6}
              value={term}
              onChange={(event) => setTerm(Number(event.target.value))}
              className="mt-3 w-full accent-[#F5B700]"
            />

            <div className="mt-6">
              <p className="text-sm font-black text-[#071A5A]">Objetivo</p>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {goals.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setGoal(item.value)}
                    className={`h-10 rounded-[6px] border px-2 text-xs font-black transition ${
                      goal === item.value
                        ? "border-accent bg-accent text-on-accent"
                        : "border-edge bg-[#F8F9FC] text-[#071A5A] hover:border-accent"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 rounded-[8px] bg-[#F8F9FC] p-4">
              <p className="text-xs font-bold text-[#596273]">Retorno estimado</p>
              <p className="mt-1 text-3xl font-black text-[#071A5A]">{formatMoney(estimatedReturn)}</p>
              <p className="mt-2 text-xs leading-relaxed text-[#596273]">
                Calculo referencial segun el plazo y las oportunidades compatibles.
              </p>
            </div>
          </aside>

          <div>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-[11px] font-black tracking-[0.16em] text-accent uppercase">
                  Catalogo exclusivo
                </p>
                <h2 className="mt-2 text-2xl font-black tracking-tight text-[#071A5A]">
                  Oportunidades de inversion
                </h2>
              </div>
              <Link
                href={whatsappUrl}
                target="_blank"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-[6px] bg-accent px-4 text-sm font-black text-on-accent transition hover:bg-accent-hover"
              >
                <WhatsappIcon className="size-5" />
                Hablar por WhatsApp
              </Link>
            </div>

            {loadError ? (
              <p role="alert" className="mt-5 rounded-[8px] border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                {loadError}
              </p>
            ) : null}

            <div className="mt-5 grid gap-4 lg:grid-cols-3">
              {opportunities.map((item) => (
                <article key={item.id} className="overflow-hidden rounded-[8px] border border-edge bg-white shadow-sm">
                  <Link
                    href={`/inversiones/${item.slug}`}
                    aria-label={`Ver oportunidad ${item.name}`}
                    className="relative block aspect-[16/9] bg-[#E9ECF4]"
                  >
                    <Image
                      src={item.coverImageUrl}
                      alt={item.name}
                      fill
                      sizes="(min-width: 1024px) 30vw, 100vw"
                      className="object-cover"
                    />
                  </Link>
                  <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-black text-[#071A5A]">{item.name}</h3>
                      <p className="mt-1 flex items-center gap-1 text-xs font-bold text-[#596273]">
                        <PinIcon className="size-4 text-accent" />
                        {item.location}
                      </p>
                      <p className="mt-2 text-sm leading-5 text-[#596273]">{item.summary}</p>
                    </div>
                    <span className="rounded-[6px] bg-accent/15 px-2.5 py-1 text-xs font-black text-[#071A5A]">
                      {item.roiPercent}% ROI
                    </span>
                  </div>

                  <div className="mt-5 grid gap-3 text-sm">
                    <OpportunityMetric Icon={RulerIcon} label="Metraje" value={item.areaLabel} />
                    <OpportunityMetric Icon={ChartIcon} label="Inicial desde" value={formatMoney(item.initialInvestment)} />
                    <OpportunityMetric Icon={CalendarIcon} label="Objetivo" value={INVESTMENT_GOAL_LABELS[item.investmentGoal]} />
                  </div>

                  <div className="mt-6 flex gap-2">
                    <Link
                      href={`/inversiones/${item.slug}`}
                      className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-[6px] bg-[#071A5A] px-3 text-xs font-black text-white transition hover:bg-brand"
                    >
                      Detalle
                      <ArrowRightIcon className="size-3.5" />
                    </Link>
                    <Link
                      href={whatsappUrl}
                      target="_blank"
                      className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-[6px] border border-edge px-3 text-xs font-black text-[#071A5A] transition hover:border-accent hover:text-accent"
                    >
                      <WhatsappIcon className="size-4" />
                      Contacto
                    </Link>
                  </div>
                  </div>
                </article>
              ))}
            </div>
            {!loadError && opportunities.length === 0 ? (
              <p className="mt-5 rounded-[8px] border border-dashed border-edge bg-white p-8 text-center text-sm text-[#596273]">
                Pronto publicaremos nuevas oportunidades de inversión.
              </p>
            ) : null}
          </div>
        </div>
      </section>

    </main>
  );
}

function SummaryCard({
  label,
  value,
  Icon,
}: {
  label: string;
  value: string;
  Icon: typeof ChartIcon;
}) {
  return (
    <div className="rounded-[8px] border border-edge bg-white p-4 shadow-sm">
      <Icon className="size-6 text-accent" />
      <p className="mt-3 text-xs font-bold text-[#596273]">{label}</p>
      <p className="mt-1 text-xl font-black text-[#071A5A]">{value}</p>
    </div>
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
    <div className="flex items-center gap-3 rounded-[6px] bg-[#F8F9FC] p-3">
      <Icon className="size-5 shrink-0 text-accent" />
      <div>
        <p className="text-[11px] font-bold text-[#596273]">{label}</p>
        <p className="font-black text-[#071A5A] capitalize">{value}</p>
      </div>
    </div>
  );
}
