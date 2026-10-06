import Link from "next/link";
import { Building2, Crown, Home, LineChart, Users } from "lucide-react";
import { CATEGORICAL, Card, STATUS } from "@/shared/ui";
import { ROUTES } from "@/shared/config/routes";
import {
  listPendingSubscriptions,
  listProfessionals,
  listSubscriptions,
} from "@/features/admin/api/server";
import { getPublicListingsServer } from "@/features/listings/api/server";
import { getPublicProjectsServer } from "@/features/projects/api/server";
import { AdminPageHeader } from "@/app/(panel)/panel/admin/admin-shell";

const PROFILE_FILTERS = [
  { key: "all", label: "Todos", href: ROUTES.panel.admin.base },
  { key: "agencies", label: "Inmobiliarias", href: `${ROUTES.panel.admin.base}?perfil=agencies` },
  { key: "agents", label: "Agentes", href: `${ROUTES.panel.admin.base}?perfil=agents` },
  { key: "users", label: "Usuarios", href: `${ROUTES.panel.admin.base}?perfil=users` },
] as const;

type ProfileFilter = (typeof PROFILE_FILTERS)[number]["key"];

function profileMatches(type: string | undefined, profile: ProfileFilter) {
  if (profile === "all") return true;
  if (profile === "agencies") return type === "REAL_ESTATE_AGENCY" || type === "DEVELOPER";
  if (profile === "agents") return type === "INDEPENDENT_AGENT";
  if (profile === "users") return type === "INDIVIDUAL_OWNER";
  return true;
}

interface PanelAdminPageProps {
  searchParams: Promise<{ perfil?: string }>;
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

function buildMonthlyTrend(items: unknown[], fallbackTotal: number) {
  const today = new Date();
  const months = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(today.getFullYear(), today.getMonth() - (5 - index), 1);
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

function ExcelColumnChart({
  categories,
  series,
}: {
  categories: string[];
  series: Array<{ label: string; color: string; values: number[] }>;
}) {
  const width = 760;
  const height = 320;
  const left = 54;
  const right = 22;
  const top = 26;
  const bottom = 74;
  const plotWidth = width - left - right;
  const plotHeight = height - top - bottom;
  const max = Math.max(1, ...series.flatMap((item) => item.values));
  const ticks = Array.from({ length: 5 }, (_, index) => Math.ceil((max / 4) * index));
  const groupWidth = plotWidth / categories.length;
  const barWidth = Math.max(6, Math.min(16, (groupWidth - 14) / series.length));

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${width} ${height}`} className="min-w-[680px]">
        <rect x="0" y="0" width={width} height={height} fill="#ffffff" />
        {ticks.map((tick, index) => {
          const y = top + plotHeight - (tick / max) * plotHeight;
          return (
            <g key={`column-tick-${index}-${tick}`}>
              <line x1={left} y1={y} x2={width - right} y2={y} stroke="#d9d9d9" strokeWidth="1" />
              <text x={left - 10} y={y + 4} textAnchor="end" fontSize="11" fill="#52514e">
                {tick}
              </text>
            </g>
          );
        })}
        {categories.map((category, categoryIndex) => {
          const x = left + categoryIndex * groupWidth + groupWidth / 2;
          return (
            <g key={`category-${categoryIndex}-${category}`}>
              {series.map((item, seriesIndex) => {
                const value = item.values[categoryIndex] ?? 0;
                const barHeight = (value / max) * plotHeight;
                const barX = x - (series.length * barWidth) / 2 + seriesIndex * barWidth;
                const barY = top + plotHeight - barHeight;
                return (
                  <g key={`bar-${categoryIndex}-${seriesIndex}-${item.label}`} className="group cursor-default">
                    <title>{`${item.label} · ${category}: ${value}`}</title>
                    <rect
                      x={barX}
                      y={barY}
                      width={barWidth - 2}
                      height={barHeight}
                      fill={item.color}
                      className="origin-bottom transition-all duration-150 group-hover:opacity-80"
                    />
                    <text
                      x={barX + (barWidth - 2) / 2}
                      y={Math.max(top + 12, barY - 6)}
                      textAnchor="middle"
                      fontSize="10"
                      fill="#0b0b0b"
                      className="opacity-0 transition-opacity duration-150 group-hover:opacity-100"
                    >
                      {value}
                    </text>
                  </g>
                );
              })}
              <text x={x} y={height - 44} textAnchor="end" fontSize="11" fill="#52514e" transform={`rotate(-45 ${x} ${height - 44})`}>
                {category}
              </text>
            </g>
          );
        })}
        <line x1={left} y1={top + plotHeight} x2={width - right} y2={top + plotHeight} stroke="#bfbfbf" />
        <g transform={`translate(${left + 60} ${height - 18})`}>
          {series.map((item, index) => (
            <g key={`legend-${index}-${item.label}`} transform={`translate(${index * 150} 0)`}>
              <rect width="10" height="10" fill={item.color} />
              <text x="16" y="9" fontSize="11" fill="#52514e">
                {item.label}
              </text>
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}

function ExcelLineChart({ data, color }: { data: Array<{ label: string; value: number }>; color: string }) {
  const width = 760;
  const height = 320;
  const left = 54;
  const right = 22;
  const top = 28;
  const bottom = 68;
  const plotWidth = width - left - right;
  const plotHeight = height - top - bottom;
  const max = Math.max(1, ...data.map((item) => item.value));
  const step = data.length > 1 ? plotWidth / (data.length - 1) : plotWidth;
  const points = data.map((item, index) => ({
    ...item,
    x: left + index * step,
    y: top + plotHeight - (item.value / max) * plotHeight,
  }));
  const path = points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${width} ${height}`} className="min-w-[680px]">
        <rect x="0" y="0" width={width} height={height} fill="#ffffff" />
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
        {points.map((point, index) => (
          <line key={`line-grid-${index}-${point.label}`} x1={point.x} y1={top} x2={point.x} y2={top + plotHeight} stroke="#e6e6e6" />
        ))}
        <path d={path} fill="none" stroke={color} strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" className="transition-opacity duration-150 hover:opacity-80" />
        {points.map((point, index) => (
          <g key={`line-point-${index}-${point.label}`} className="group cursor-default">
            <title>{`${point.label}: ${point.value}`}</title>
            <rect
              x={point.x - 5}
              y={point.y - 5}
              width="10"
              height="10"
              fill={color}
              transform={`rotate(45 ${point.x} ${point.y})`}
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
            <text x={point.x} y={height - 42} textAnchor="end" fontSize="11" fill="#52514e" transform={`rotate(-45 ${point.x} ${height - 42})`}>
              {point.label}
            </text>
          </g>
        ))}
        <line x1={left} y1={top + plotHeight} x2={width - right} y2={top + plotHeight} stroke="#bfbfbf" />
      </svg>
    </div>
  );
}

function ExcelPieChart({ data }: { data: Array<{ label: string; value: number; color: string }> }) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  if (total === 0) {
    return <div className="flex min-h-64 items-center justify-center text-sm text-muted">Sin datos para graficar.</div>;
  }

  const slices = data.map((item, index) => {
    const previous = data.slice(0, index).reduce((sum, entry) => sum + entry.value, 0);
    const start = -90 + (previous / total) * 360;
    const end = start + (item.value / total) * 360;
    return { ...item, start, end, slice: end - start };
  });

  return (
    <div className="grid items-center gap-5 md:grid-cols-[1fr_180px]">
      <svg viewBox="0 0 300 240" className="mx-auto w-full max-w-[360px]">
        <rect x="0" y="0" width="300" height="240" fill="#ffffff" />
        {slices.map((item, index) => {
          const startRad = (Math.PI / 180) * item.start;
          const endRad = (Math.PI / 180) * item.end;
          const largeArc = item.slice > 180 ? 1 : 0;
          const x1 = 150 + 88 * Math.cos(startRad);
          const y1 = 120 + 88 * Math.sin(startRad);
          const x2 = 150 + 88 * Math.cos(endRad);
          const y2 = 120 + 88 * Math.sin(endRad);

          return (
            <path
              key={`slice-${index}-${item.label}`}
              d={`M 150 120 L ${x1} ${y1} A 88 88 0 ${largeArc} 1 ${x2} ${y2} Z`}
              fill={item.color}
              stroke="#ffffff"
              strokeWidth="2"
              className="cursor-default transition-opacity duration-150 hover:opacity-80"
            >
              <title>{`${item.label}: ${item.value}`}</title>
            </path>
          );
        })}
      </svg>
      <ul className="grid gap-2 text-xs">
        {data.map((item, index) => (
          <li key={`pie-legend-${index}-${item.label}`} className="flex items-center gap-2 rounded-card px-2 py-1 transition-colors hover:bg-surface-muted">
            <span className="size-3 shrink-0" style={{ backgroundColor: item.color }} />
            <span className="min-w-0 flex-1 truncate text-ink">{item.label}</span>
            <span className="font-black text-muted">{item.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function TopProjectList({ data }: { data: Array<{ label: string; value: number; color: string }> }) {
  const max = Math.max(1, ...data.map((item) => item.value));

  if (data.length === 0) {
    return (
      <div className="flex min-h-44 items-center justify-center rounded-card bg-surface-muted px-5 text-center text-sm text-muted">
        Cuando existan proyectos en revisión, los 10 con mayor demanda aparecerán aquí.
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
    <Card className="flex min-h-40 flex-col items-center justify-center overflow-hidden p-5 text-center">
      <div className="flex flex-col items-center">
        <span className={`flex size-11 items-center justify-center rounded-xl ${tone}`}>
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <p className="mt-4 text-[11px] font-black tracking-[0.16em] text-muted uppercase">{label}</p>
        <p className="mt-2 font-display text-4xl font-black tracking-tight text-brand">{value}</p>
      </div>
      <p className="mt-3 text-xs font-semibold text-muted">{hint}</p>
    </Card>
  );
}

export default async function PanelAdminPage({ searchParams }: PanelAdminPageProps) {
  const { perfil } = await searchParams;
  const profile = PROFILE_FILTERS.some((item) => item.key === perfil) ? (perfil as ProfileFilter) : "all";
  const [professionalPool, propertiesPage, projectsPage, subscriptions] =
    await Promise.all([
      listProfessionals(1, 200),
      getPublicListingsServer(200, 1).catch(() => ({ items: [], total: 0, page: 1, pageSize: 200, hasMore: false })),
      getPublicProjectsServer(200).catch(() => ({ items: [], total: 0, page: 1, pageSize: 200, hasMore: false })),
      listSubscriptions(1, 200).catch(() =>
        listPendingSubscriptions(1, 100).catch(() => ({ items: [], total: 0, pageSize: 100 })),
      ),
    ]);

  const allProfessionals = professionalPool.items;
  const pending = allProfessionals.filter((item) => item.status === "PENDING").length;
  const agenciesCount = allProfessionals.filter((item) => item.type === "REAL_ESTATE_AGENCY").length;
  const agentsCount = allProfessionals.filter((item) => item.type === "INDEPENDENT_AGENT").length;
  const developersCount = allProfessionals.filter((item) => item.type === "DEVELOPER").length;
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
  const accountTrend = buildMonthlyTrend(filteredProfessionals, filteredProfessionals.length);
  const propertyTrend = buildMonthlyTrend(publishedProperties, publishedProperties.length);
  const projectTrend = buildMonthlyTrend(publishedProjects, publishedProjects.length);
  const membershipTrend = buildMonthlyTrend(filteredSubscriptions, visibleMembershipTotal || filteredSubscriptions.length);
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
  const profileBars = [
    { label: "Inmobiliarias", value: agenciesCount, color: CATEGORICAL[0] },
    { label: "Agentes", value: agentsCount, color: CATEGORICAL[1] },
    { label: "Desarroll.", value: developersCount, color: CATEGORICAL[2] },
    { label: "Pendientes", value: pending, color: STATUS.warning },
  ];
  return (
    <div className="flex flex-col gap-7">
      <AdminPageHeader
        title="Centro de control"
        description="Indicadores principales para cuentas, publicaciones, proyectos y membresías."
        align="center"
      />

      <section className="relative overflow-hidden rounded-card border border-edge bg-surface p-5 shadow-[var(--shadow-card)] sm:p-6">
        <div className="absolute inset-x-0 top-0 h-1.5 bg-brand" aria-hidden />
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[11px] font-black tracking-[0.18em] text-accent uppercase">Visión general</p>
            <h2 className="mt-1 font-display text-3xl font-black tracking-tight text-brand">
              Rendimiento del sistema
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {PROFILE_FILTERS.map((item) => {
              const active = item.key === profile;
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className={`inline-flex h-9 items-center rounded-card border px-3 text-xs font-black transition-colors ${
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

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
          <MetricCard
            label="Membresías"
            value={String(visibleMembershipTotal)}
            hint={`${formatDelta(membershipCurrent, membershipPrevious)} solicitudes del periodo`}
            tone="bg-warning/15 text-warning"
            Icon={Crown}
          />
          <MetricCard
            label="Proyectos"
            value={String(publishedProjects.length)}
            hint={`${formatDelta(projectCurrent, projectPrevious)} frente al mes anterior`}
            tone="bg-accent/15 text-accent"
            Icon={Building2}
          />
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px] 2xl:grid-cols-[minmax(0,1fr)_390px]">
        <div className="grid min-w-0 gap-5 xl:grid-cols-2">
          <Card className="min-h-80 p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-black tracking-[0.16em] text-accent uppercase">Actividad mensual</p>
              <h3 className="mt-1 text-lg font-bold text-ink">Cuentas, publicaciones y membresías</h3>
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
                { label: "Membresías", color: "#ffc000", values: membershipTrend.map((item) => item.value) },
              ]}
            />
          </div>
        </Card>

          <Card className="min-h-80 p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-black tracking-[0.16em] text-accent uppercase">Publicaciones</p>
              <h3 className="mt-1 text-lg font-bold text-ink">Evolución de propiedades y proyectos</h3>
            </div>
            <span className="rounded-full bg-accent/15 px-3 py-1 text-xs font-black text-accent">
              {formatDelta(projectCurrent, projectPrevious)}
            </span>
          </div>
          <div className="mt-5">
            <ExcelLineChart data={combinedPublicationTrend} color="#4472c4" />
          </div>
        </Card>

          <Card className="min-h-80 p-5 xl:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-black tracking-[0.16em] text-accent uppercase">Perfiles</p>
              <h3 className="mt-1 text-lg font-bold text-ink">Distribución del sistema</h3>
            </div>
            <LineChart className="size-5 text-brand" aria-hidden="true" />
          </div>
          <div className="mt-6">
            <ExcelPieChart data={profileBars} />
          </div>
        </Card>
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
    </div>
  );
}
