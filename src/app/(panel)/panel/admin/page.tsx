import { ProfileDistribution } from "@/features/admin/components/profile-distribution";
import { loadProfileDistribution } from "@/features/admin/api/profile-distribution";
import Link from "next/link";
import { Building2, ChevronDown, Crown, Home, LineChart, SlidersHorizontal, Users } from "lucide-react";
import { CATEGORICAL, Card } from "@/shared/ui";
import { ROUTES } from "@/shared/config/routes";
import {
  listPendingSubscriptions,
  listProfessionals,
  listSubscriptions,
} from "@/features/admin/api/server";
import { getPublicListingsServer } from "@/features/listings/api/server";
import { getPublicProjectsServer } from "@/features/projects/api/server";
import { getSession } from "@/features/auth/api/server";
import { AdminDashboardWelcome, AdminDashboardShortcuts } from "@/features/admin/components/admin-dashboard-welcome";

const PROFILE_FILTERS = [
  { key: "all", label: "Todos", href: ROUTES.panel.admin.base },
  { key: "agencies", label: "Inmobiliarias", href: `${ROUTES.panel.admin.base}?perfil=agencies` },
  { key: "agents", label: "Agentes", href: `${ROUTES.panel.admin.base}?perfil=agents` },
  { key: "users", label: "Usuarios", href: `${ROUTES.panel.admin.base}?perfil=users` },
] as const;

const RANGE_FILTERS = [
  { key: "1m", label: "1 mes", months: 1 },
  { key: "6m", label: "6 meses", months: 6 },
  { key: "12m", label: "1 año", months: 12 },
] as const;

type ProfileFilter = (typeof PROFILE_FILTERS)[number]["key"];
type RangeFilter = (typeof RANGE_FILTERS)[number]["key"];

function profileMatches(type: string | undefined, profile: ProfileFilter) {
  if (profile === "all") return true;
  if (profile === "agencies") return type === "REAL_ESTATE_AGENCY" || type === "DEVELOPER";
  if (profile === "agents") return type === "INDEPENDENT_AGENT";
  if (profile === "users") return type === "INDIVIDUAL_OWNER";
  return true;
}

interface PanelAdminPageProps {
  searchParams: Promise<{ perfil?: string; rango?: string }>;
}

function formatDelta(current: number, previous: number) {
  if (previous === 0) return current > 0 ? "+100%" : "0%";
  const value = Math.round(((current - previous) / previous) * 100);
  return `${value >= 0 ? "+" : ""}${value}%`;
}

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(date: Date) {
  return new Intl.DateTimeFormat("es-PE", { month: "short" }).format(date).replace(".", "");
}

function getDateValue(item: unknown) {
  if (!item || typeof item !== "object") return null;
  const value = (item as { publishedAt?: unknown; createdAt?: unknown; startedAt?: unknown; updatedAt?: unknown }).publishedAt ??
    (item as { publishedAt?: unknown; createdAt?: unknown; startedAt?: unknown; updatedAt?: unknown }).startedAt ??
    (item as { publishedAt?: unknown; createdAt?: unknown; startedAt?: unknown; updatedAt?: unknown }).createdAt ??
    (item as { publishedAt?: unknown; createdAt?: unknown; startedAt?: unknown; updatedAt?: unknown }).updatedAt;

  if (typeof value !== "string") return null;
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date : null;
}

function buildMonthlyTrend(items: unknown[], fallbackTotal: number, monthsCount: number) {
  const today = new Date();
  const months = Array.from({ length: monthsCount }, (_, index) => {
    const date = new Date(today.getFullYear(), today.getMonth() - (monthsCount - 1 - index), 1);
    return { key: monthKey(date), label: monthLabel(date), value: 0 };
  });

  for (const item of items) {
    const date = getDateValue(item);
    if (!date) continue;
    const found = months.find((month) => month.key === monthKey(date));
    if (found) found.value += 1;
  }

  if (months.every((month) => month.value === 0) && fallbackTotal > 0) {
    months[months.length - 1].value = fallbackTotal;
  }

  return months.map(({ label, value }) => ({ label, value }));
}

function numericField(item: unknown, field: string) {
  if (!item || typeof item !== "object") return 0;
  const value = (item as Record<string, unknown>)[field];
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function TrendLegend({
  items,
}: {
  items: Array<{ label: string; color: string }>;
}) {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-2">
      {items.map((item) => (
        <span key={item.label} className="inline-flex items-center gap-2 text-xs font-bold text-muted">
          <span className="size-2.5 rounded-full" style={{ backgroundColor: item.color }} />
          {item.label}
        </span>
      ))}
    </div>
  );
}

function ExcelColumnChart({
  categories,
  series,
}: {
  categories: string[];
  series: Array<{ label: string; color: string; values: number[] }>;
}) {
  const max = Math.max(1, ...series.flatMap((item) => item.values));

  return (
    <div className="min-w-0 w-full">
      <TrendLegend items={series} />
      <div className="mt-5 grid min-h-72 grid-cols-[auto_minmax(0,1fr)] gap-3">
        <div className="flex flex-col justify-between pb-7 text-right text-[11px] font-bold text-muted">
          {[max, Math.ceil(max * 0.66), Math.ceil(max * 0.33), 0].map((tick, index) => (
            <span key={`axis-tick-${index}`}>{tick}</span>
          ))}
        </div>
        <div className="relative grid min-w-0 grid-flow-col gap-1 sm:gap-2 pb-1 overflow-hidden">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-edge" />
          <div className="pointer-events-none absolute inset-x-0 top-1/3 h-px bg-edge/70" />
          <div className="pointer-events-none absolute inset-x-0 top-2/3 h-px bg-edge/70" />
          {categories.map((category, categoryIndex) => (
            <div key={category} className="flex min-w-0 flex-col justify-end gap-2">
              <div className="relative flex h-48 sm:h-60 items-end justify-center gap-0.5 sm:gap-1 rounded-card px-0.5 sm:px-1 transition-colors hover:bg-surface-muted">
                {series.map((item) => {
                  const value = item.values[categoryIndex] ?? 0;
                  const height = Math.max(value > 0 ? 8 : 2, (value / max) * 180);
                  return (
                    <div
                      key={`${category}-${item.label}`}
                      title={`${item.label} - ${category}: ${value}`}
                      className="w-1.5 sm:w-2.5 md:w-3 rounded-t-full transition-all duration-200 hover:-translate-y-1 hover:opacity-80"
                      style={{ height, backgroundColor: item.color }}
                    />
                  );
                })}
              </div>
              <span className="truncate text-center text-[9px] sm:text-[11px] font-bold capitalize text-muted" title={category}>
                {category}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ExcelLineChart({ data, color }: { data: Array<{ label: string; value: number }>; color: string }) {
  const width = 900;
  const height = 340;
  const left = 54;
  const right = 28;
  const top = 34;
  const bottom = 64;
  const plotWidth = width - left - right;
  const plotHeight = height - top - bottom;
  const max = Math.max(1, ...data.map((item) => item.value));
  const step = data.length > 1 ? plotWidth / (data.length - 1) : plotWidth;
  const points = data.map((item, index) => ({
    ...item,
    x: left + index * step,
    y: top + plotHeight - (item.value / max) * plotHeight,
  }));
  const path = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");
  const area = `${path} L ${left + (points.length - 1) * step} ${top + plotHeight} L ${left} ${top + plotHeight} Z`;

  return (
    <div className="min-w-0 w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
        <defs>
          <linearGradient id="publicationTrendFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.22" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width={width} height={height} rx="16" fill="#ffffff" />
        {Array.from({ length: 6 }, (_, index) => {
          const value = Math.ceil((max / 5) * index);
          const y = top + plotHeight - (value / max) * plotHeight;
          return (
            <g key={`line-tick-${index}-${value}`}>
              <line x1={left} y1={y} x2={width - right} y2={y} stroke="#d9d9d9" />
              <text x={left - 10} y={y + 4} textAnchor="end" fontSize="11" fill="#52514e">
                {value}
              </text>
            </g>
          );
        })}
        <path d={area} fill="url(#publicationTrendFill)" />
        <path d={path} fill="none" stroke={color} strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" className="transition-opacity duration-150 hover:opacity-80" />
        {points.map((point, index) => (
          <g key={`line-point-${index}-${point.label}`} className="group cursor-default">
            <title>{`${point.label}: ${point.value}`}</title>
            <line x1={point.x} y1={top} x2={point.x} y2={top + plotHeight} stroke="#e6e6e6" />
            <circle
              cx={point.x}
              cy={point.y}
              r="5"
              fill={color}
              className="transition-all duration-150 group-hover:opacity-80"
            />
            <circle
              cx={point.x}
              cy={point.y}
              r="14"
              fill={color}
              className="opacity-0 transition-opacity duration-150 group-hover:opacity-10"
            />
            <text
              x={point.x}
              y={Math.max(top + 14, point.y - 14)}
              textAnchor="middle"
              fontSize="11"
              fontWeight="700"
              fill="#0b0b0b"
              className="opacity-0 transition-opacity duration-150 group-hover:opacity-100"
            >
              {point.value}
            </text>
            <text x={point.x} y={height - 34} textAnchor="middle" fontSize="11" fill="#52514e">
              {point.label}
            </text>
          </g>
        ))}
        <line x1={left} y1={top + plotHeight} x2={width - right} y2={top + plotHeight} stroke="#bfbfbf" />
      </svg>
    </div>
  );
}

function TopProjectList({ data }: { data: Array<{ label: string; value: number; color: string }> }) {
  const max = Math.max(1, ...data.map((item) => item.value));

  if (data.length === 0) {
    return (
      <div className="flex min-h-44 items-center justify-center rounded-card bg-surface-muted px-5 text-center text-sm text-muted">
        Aún no hay proyectos con lotes registrados para mostrar.
      </div>
    );
  }

  return (
    <ol className="grid gap-3">
      {data.map((item, index) => (
        <li
          key={`${item.label}-${index}`}
          className="group grid grid-cols-[2rem_minmax(0,1fr)_3.25rem] items-center gap-3 rounded-card border border-edge bg-surface px-3 py-2.5 transition-all duration-150 hover:border-brand hover:shadow-[var(--shadow-card)]"
        >
          <span className="flex size-7 items-center justify-center rounded-lg bg-brand text-xs font-black text-on-brand">
            {index + 1}
          </span>
          <div className="min-w-0">
            <span className="block truncate text-xs font-bold text-ink" title={item.label}>
              {item.label}
            </span>
            <div className="mt-1.5 h-2 rounded-full bg-edge">
              <div
                className="h-2 rounded-full transition-opacity duration-150 group-hover:opacity-80"
                style={{ width: `${Math.max(4, (item.value / max) * 100)}%`, backgroundColor: item.color }}
              />
            </div>
          </div>
          <span className="text-right text-xs font-black text-brand">
            {item.value}
            <span className="block text-[9px] font-bold text-muted">lotes</span>
          </span>
        </li>
      ))}
    </ol>
  );
}

function MetricCard({
  label,
  value,
  hint,
  tone,
  Icon,
}: {
  label: string;
  value: string;
  hint: string;
  tone: string;
  Icon: typeof Users;
}) {
  return (
    <Card className="flex aspect-square min-w-0 flex-col items-center justify-center overflow-hidden p-2 text-center sm:aspect-auto sm:min-h-40 sm:p-5">
      <div className="flex flex-col items-center">
        <span className={`flex size-9 items-center justify-center rounded-xl sm:size-11 ${tone}`}>
          <Icon className="size-4 sm:size-5" aria-hidden="true" />
        </span>
        <p className="mt-2 text-[9px] font-black tracking-[0.12em] text-muted uppercase sm:mt-4 sm:text-[11px] sm:tracking-[0.16em]">{label}</p>
        <p className="mt-0.5 font-display text-2xl font-black tracking-tight text-brand sm:mt-2 sm:text-4xl">{value}</p>
      </div>
      <p className="mt-1 text-[10px] font-semibold leading-tight text-muted sm:mt-3 sm:text-xs">{hint}</p>
    </Card>
  );
}

export default async function PanelAdminPage({ searchParams }: PanelAdminPageProps) {
  const { perfil, rango } = await searchParams;
  const profile = PROFILE_FILTERS.some((item) => item.key === perfil) ? (perfil as ProfileFilter) : "all";
  const range = RANGE_FILTERS.some((item) => item.key === rango) ? (rango as RangeFilter) : "6m";
  const rangeConfig = RANGE_FILTERS.find((item) => item.key === range) ?? RANGE_FILTERS[1];
  const [professionalPool, propertiesPage, projectsPage, subscriptions, session, distribution] =
    await Promise.all([
      listProfessionals(1, 200),
      getPublicListingsServer(200, 1).catch(() => ({ items: [], total: 0, page: 1, pageSize: 200, hasMore: false })),
      getPublicProjectsServer(200).catch(() => ({ items: [], total: 0, page: 1, pageSize: 200, hasMore: false })),
      listSubscriptions(1, 200).catch(() =>
        listPendingSubscriptions(1, 100).catch(() => ({ items: [], total: 0, pageSize: 100 })),
      ),
      getSession(),
      loadProfileDistribution().then(result => result.data).catch(() => undefined),
    ]);

  const allProfessionals = professionalPool.items;
  const pending = allProfessionals.filter((item) => item.status === "PENDING").length;
  const approvedCount = allProfessionals.filter((item) => item.status === "APPROVED").length;
  const publishedProperties = propertiesPage.items.filter((item) => profileMatches(item.agent?.type, profile));
  const publishedProjects = projectsPage.items.filter((item) => profileMatches(item.agent?.type, profile));
  const filteredProfessionals = allProfessionals.filter((item) => {
    if (profile === "agencies") return item.type === "REAL_ESTATE_AGENCY";
    if (profile === "agents") return item.type === "INDEPENDENT_AGENT";
    if (profile === "users") return false;
    return true;
  });
  const filteredSubscriptions = subscriptions.items.filter((item) => profileMatches(item.agentProfile.type, profile));
  const visibleMembershipTotal = profile === "all" ? subscriptions.total : filteredSubscriptions.length;
  const accountTrend = buildMonthlyTrend(filteredProfessionals, filteredProfessionals.length, rangeConfig.months);
  const propertyTrend = buildMonthlyTrend(publishedProperties, publishedProperties.length, rangeConfig.months);
  const projectTrend = buildMonthlyTrend(publishedProjects, publishedProjects.length, rangeConfig.months);
  const membershipTrend = buildMonthlyTrend(
    filteredSubscriptions,
    visibleMembershipTotal || filteredSubscriptions.length,
    rangeConfig.months,
  );
  const monthlyCategories = propertyTrend.map((item) => item.label);
  const combinedPublicationTrend = propertyTrend.map((item, index) => ({
    label: item.label,
    value: item.value + (projectTrend[index]?.value ?? 0),
  }));
  const propertyCurrent = propertyTrend[propertyTrend.length - 1]?.value ?? 0;
  const propertyPrevious = propertyTrend[propertyTrend.length - 2]?.value ?? 0;
  const projectCurrent = projectTrend[projectTrend.length - 1]?.value ?? 0;
  const projectPrevious = projectTrend[projectTrend.length - 2]?.value ?? 0;
  const membershipCurrent = membershipTrend[membershipTrend.length - 1]?.value ?? 0;
  const membershipPrevious = membershipTrend[membershipTrend.length - 2]?.value ?? 0;
  const topProjects = publishedProjects
    .map((project, index) => ({
      label: "name" in project ? project.name : `Proyecto ${index + 1}`,
      value: Math.max(0, numericField(project, "lotsCount"), numericField(project, "totalLots")),
      color: CATEGORICAL[index % CATEGORICAL.length],
    }))
    .filter((project) => project.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);
  return (
    <div className="flex flex-col gap-7">
      <AdminDashboardWelcome name={session?.name} />

      <section className="relative overflow-hidden rounded-card border border-edge bg-surface p-5 shadow-[var(--shadow-card)] sm:p-6">
        <div className="absolute inset-x-0 top-0 h-1.5 bg-brand" aria-hidden />
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[11px] font-black tracking-[0.18em] text-accent uppercase">Visión general</p>
            <h2 className="mt-1 font-display text-3xl font-black tracking-tight text-brand">
              Rendimiento del sistema
            </h2>
          </div>
          <div className="w-full sm:w-auto">
            <details className="group grid gap-2 sm:hidden">
              <summary className="flex min-h-10 list-none items-center justify-between gap-3 rounded-xl border border-edge bg-surface px-3 text-sm font-bold text-brand shadow-sm [&::-webkit-details-marker]:hidden">
                <span className="flex min-w-0 items-center gap-2">
                  <SlidersHorizontal size={16} className="shrink-0" />
                  <span>Filtros</span>
                  <span className="truncate text-xs font-medium text-muted">
                    · {RANGE_FILTERS.find((item) => item.key === range)?.label} · {PROFILE_FILTERS.find((item) => item.key === profile)?.label}
                  </span>
                </span>
                <ChevronDown size={16} className="shrink-0 transition-transform group-open:rotate-180" />
              </summary>
              <div className="grid gap-3 rounded-xl border border-edge bg-surface-muted p-3">
                <div className="grid gap-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-muted">Periodo</span>
                  <div className="grid grid-cols-3 gap-1">
                    {RANGE_FILTERS.map((item) => {
                      const active = item.key === range;
                      const params = new URLSearchParams();
                      if (profile !== "all") params.set("perfil", profile);
                      params.set("rango", item.key);
                      return (
                        <Link
                          key={item.key}
                          href={`${ROUTES.panel.admin.base}?${params.toString()}`}
                          className={`inline-flex min-h-8 items-center justify-center rounded-lg border px-1.5 text-center text-[11px] font-bold transition-colors ${
                            active
                              ? "border-brand bg-brand text-on-brand"
                              : "border-edge bg-surface text-muted hover:border-brand hover:text-brand"
                          }`}
                        >
                          {item.label}
                        </Link>
                      );
                    })}
                  </div>
                </div>
                <div className="grid gap-1.5 border-t border-edge pt-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-muted">Perfil</span>
                  <div className="grid grid-cols-2 gap-1">
                    {PROFILE_FILTERS.map((item) => {
                      const active = item.key === profile;
                      return (
                        <Link
                          key={item.key}
                          href={`${item.href}${item.href.includes("?") ? "&" : "?"}rango=${range}`}
                          className={`inline-flex min-h-8 items-center justify-center rounded-lg border px-2 text-center text-[11px] font-bold transition-colors ${
                            active
                              ? "border-brand bg-brand text-on-brand"
                              : "border-edge bg-surface text-muted hover:border-brand hover:text-brand"
                          }`}
                        >
                          {item.label}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            </details>
            <div className="hidden sm:flex sm:flex-wrap sm:items-center sm:gap-3">
        <div className="grid grid-cols-3 gap-1 sm:flex sm:flex-wrap sm:items-center sm:gap-2">
          {RANGE_FILTERS.map((item) => {
            const active = item.key === range;
            const params = new URLSearchParams();
            if (profile !== "all") params.set("perfil", profile);
            params.set("rango", item.key);
            return (
              <Link
                key={item.key}
                href={`${ROUTES.panel.admin.base}?${params.toString()}`}
                className={`inline-flex min-h-8 items-center justify-center rounded-card border px-1.5 text-center text-[11px] font-black transition-colors sm:h-9 sm:min-h-0 sm:px-3 sm:text-xs ${
                  active
                    ? "border-brand bg-brand text-on-brand"
                    : "border-edge bg-surface text-muted hover:border-brand hover:text-brand"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
          <div className="grid grid-cols-2 gap-1 border-t border-edge pt-2 sm:flex sm:flex-wrap sm:gap-2 sm:border-l sm:border-t-0 sm:pt-0 sm:pl-3">
            {PROFILE_FILTERS.map((item) => {
              const active = item.key === profile;
              return (
                <Link
                  key={item.key}
                  href={`${item.href}${item.href.includes("?") ? "&" : "?"}rango=${range}`}
                  className={`inline-flex min-h-8 items-center justify-center rounded-card border px-2 text-center text-[11px] font-black transition-colors sm:h-9 sm:min-h-0 sm:px-3 sm:text-xs ${
                    active
                      ? "border-brand bg-brand text-on-brand"
                      : "border-edge bg-surface text-muted hover:border-brand hover:text-brand"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
          </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-2 sm:gap-4 xl:grid-cols-4">
          <MetricCard
            label="Profesionales"
            value={String(allProfessionals.length)}
            hint={`${approvedCount} aprobados / ${pending} pendientes`}
            tone="bg-brand-soft text-brand"
            Icon={Users}
          />
          <MetricCard
            label="Publicaciones"
            value={String(publishedProperties.length)}
            hint={`${formatDelta(propertyCurrent, propertyPrevious)} frente al mes anterior`}
            tone="bg-success/10 text-success"
            Icon={Home}
          />
          {/* [OCULTO-DEMO A15] Dashboard: metrica Membresias
          <MetricCard
            label="Membresias"
            value={String(visibleMembershipTotal)}
            hint={`${formatDelta(membershipCurrent, membershipPrevious)} solicitudes del periodo`}
            tone="bg-warning/15 text-warning"
            Icon={Crown}
          />
          */}
          <MetricCard
            label="Proyectos"
            value={String(publishedProjects.length)}
            hint={`${formatDelta(projectCurrent, projectPrevious)} frente al mes anterior`}
            tone="bg-accent/15 text-accent"
            Icon={Building2}
          />
        </div>
      </section>

      <section className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_360px] 2xl:grid-cols-[minmax(0,1fr)_390px]">
        <div className="grid min-w-0 gap-5">
        <Card className="min-h-80 p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-black tracking-[0.16em] text-accent uppercase">Actividad mensual</p>
              <h3 className="mt-1 text-lg font-bold text-ink">Cuentas, publicaciones y membresias</h3>
            </div>
            <span className="rounded-full bg-success/10 px-3 py-1 text-xs font-black text-success">
              {formatDelta(propertyCurrent, propertyPrevious)}
            </span>
          </div>
          <div className="mt-5">
            <ExcelColumnChart
              categories={monthlyCategories}
              series={[
                { label: "Profesionales", color: "#4472c4", values: accountTrend.map((item) => item.value) },
                { label: "Propiedades", color: "#ed7d31", values: propertyTrend.map((item) => item.value) },
                { label: "Proyectos", color: "#a5a5a5", values: projectTrend.map((item) => item.value) },
                { label: "Membresias", color: "#ffc000", values: membershipTrend.map((item) => item.value) },
              ]}
            />
          </div>
        </Card>

        <Card className="min-h-80 p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-black tracking-[0.16em] text-accent uppercase">Publicaciones</p>
              <h3 className="mt-1 text-lg font-bold text-ink">Evolucion de propiedades y proyectos</h3>
            </div>
            <span className="rounded-full bg-accent/15 px-3 py-1 text-xs font-black text-accent">
              {formatDelta(projectCurrent, projectPrevious)}
            </span>
          </div>
          <div className="mt-5">
            <ExcelLineChart data={combinedPublicationTrend} color="#4472c4" />
          </div>
        </Card>
        {/* [OCULTO-DEMO A14] Dashboard: tarjeta Distribucion del sistema
        <Card className="min-h-80 p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-black tracking-[0.16em] text-accent uppercase">Perfiles</p>
              <h3 className="mt-1 text-lg font-bold text-ink">Distribucion del sistema</h3>
            </div>
            <LineChart className="size-5 text-brand" aria-hidden="true" />
          </div>
          <div className="mt-6">
            <ProfileDistribution initialData={distribution} />
          </div>
        </Card>
        */}

        </div>

        <aside className="xl:sticky xl:top-28 xl:self-start">

        <Card className="min-h-80 p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-black tracking-[0.16em] text-accent uppercase">Inventario visible</p>
              <h3 className="mt-1 text-lg font-bold text-ink">Top 10 por lotes</h3>
            </div>
            <span className="rounded-full bg-brand-soft px-3 py-1 text-xs font-black text-brand">
              {topProjects.length}/10
            </span>
          </div>
          <div className="mt-5">
            <TopProjectList data={topProjects} />
          </div>
        </Card>
        </aside>
      </section>
      <AdminDashboardShortcuts />
    </div>
  );
}
