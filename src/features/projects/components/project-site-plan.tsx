"use client";

import { useEffect, useMemo, useState } from "react";
import { LotBudgetFinder } from "@/shared/ui/lot-budget-finder";
import { findBudgetLots, type LotBudgetFilter } from "@/shared/lib/lot-budget";
import { Eye, EyeOff, X } from "lucide-react";
import { apiClient } from "@/shared/lib/api/client";
import { ApiError } from "@/shared/lib/api/client";
import { PublicPlanAccess } from "@/shared/ui/public-plan-access";
import { ProtectedLotPdfDownload } from "@/shared/ui/protected-lot-pdf-download";
import { buildArizWhatsappUrl } from "@/shared/lib/whatsapp";
import { SitePlanMap } from "@/shared/ui/site-plan-map";
import {
  LOT_LABELS,
  LOT_COLORS,
  type SitePlan,
  type Point,
} from "../types/site-plan";
import s from "./site-plan.module.css";

export function ProjectSitePlan({
  slug,
  center,
  currency,
}: {
  slug: string;
  center: Point;
  currency: "PEN" | "USD";
}) {
  const [plan, setPlan] = useState<SitePlan | null>(null);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);
  const [showImage, setShowImage] = useState(false);
  const [accessCode, setAccessCode] = useState("");
  const [accessRequired, setAccessRequired] = useState(true);
  const [invalidCode, setInvalidCode] = useState(false);
  const [accessCodeBusy, setAccessCodeBusy] = useState(false);
  const [accessSkipped, setAccessSkipped] = useState(false);
  const [selected, setSelected] = useState<string>();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [budgetFilter, setBudgetFilter] = useState<LotBudgetFilter | null>(null);
  const budgetResults = useMemo(() => plan && budgetFilter ? findBudgetLots(plan.lots, budgetFilter) : null, [plan, budgetFilter]);
  const matchingLotIds = useMemo(() => budgetResults ? [...budgetResults.matches, ...budgetResults.nearby].map(lot => lot.id) : undefined, [budgetResults]);
  useEffect(() => {
    let alive = true;
    if (!accessCode) return () => { alive = false; };
    apiClient
      .get<SitePlan | null>(`/projects/${encodeURIComponent(slug)}/site-plan`, {
        cache: "no-store",
        headers: accessCode ? { "X-Site-Plan-Code": accessCode } : undefined,
      })
      .then((result) => {
        if (alive) {
          setPlan(result);
          setError(false);
          setAccessRequired(false);
          setInvalidCode(false);
          setAccessSkipped(false);
          setAccessCodeBusy(false);
        }
      })
      .catch((cause: unknown) => {
        if (!alive) return;
        if (cause instanceof ApiError && cause.status === 403) {
          setAccessRequired(true);
          setInvalidCode(Boolean(accessCode));
          setAccessCodeBusy(false);
        } else {
          setError(true);
          setAccessCodeBusy(false);
        }
      });
    return () => {
      alive = false;
    };
  }, [slug, retry, accessCode]);
  const lot = plan?.lots.find((item) => item.id === selected);
  const money = (value: number) =>
    new Intl.NumberFormat("es-PE", { style: "currency", currency }).format(
      value,
    );
  if (error)
    return (
      <section className={`${s.editor} my-8`}>
        <div className={s.card}>
          <p>No se pudo cargar el plano interactivo.</p>
          <button onClick={() => setRetry((n) => n + 1)}>Reintentar</button>
        </div>
      </section>
    );
  if (accessRequired)
    return (
      <section className={`${s.editor} my-8`}>
        <PublicPlanAccess
          busy={accessCodeBusy}
          invalid={invalidCode}
          onSubmit={code => {
            setInvalidCode(false);
            setAccessCodeBusy(true);
            setAccessCode(code);
          }}
          onOmit={() => {
            setAccessCode("");
            setAccessCodeBusy(false);
            setAccessRequired(false);
            setAccessSkipped(true);
          }}
          contactHref={buildArizWhatsappUrl(`Hola, quisiera coordinar con un asesor para obtener el código del proyecto ${slug}.`)}
        />
      </section>
    );
  if (!plan && accessSkipped)
    return (
      <section className={`${s.editor} my-8`}>
        <div className={s.card}>
          <p>Se omitió el código. Puedes seguir viendo la ubicación del proyecto sin mostrar el plano.</p>
          <button type="button" onClick={() => { setAccessSkipped(false); setAccessRequired(true); }}>
            Ingresar código para ver el plano
          </button>
        </div>
      </section>
    );
  if (!plan) return null;
  const filtered = plan.lots.filter(
    (item) =>
      (filter === "ALL" || item.status === filter) &&
      (!matchingLotIds || matchingLotIds.includes(item.id)) &&
      `${item.code} ${item.block} ${item.street}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  return (
    <section
      className={`${s.editor} my-9`}
      aria-label="Plano interactivo del proyecto"
    >
      <div className={s.toolbar}>
        <div>
          <h2>Explora el plano del proyecto</h2>
          <p className={s.muted}>
            Selecciona un lote para ver sus dimensiones, disponibilidad y formas
            de pago.
          </p>
        </div>
        <button onClick={() => setShowImage(!showImage)}>
          {showImage ? <EyeOff size={16} /> : <Eye size={16} />}
          {showImage ? "Ocultar imagen" : "Mostrar imagen"}
        </button>
      </div>
      <div className={s.layout}>
        <SitePlanMap
          focusPlanRequest={1}
          focusPlanZoom={17}
          matchingLotIds={matchingLotIds}
          currency={currency}
          plan={plan}
          center={center}
          showImage={showImage}
          selected={selected}
          onSelect={setSelected}
          publicView
        />
        <aside className={s.sidebar}>
          <LotBudgetFinder lots={plan.lots} currency={currency} filter={budgetFilter} onChange={setBudgetFilter} onSelect={setSelected} />
          {lot && (
            <article
              className={`${s.card} ${s.fields}`}
              aria-label={`Ficha del lote ${lot.code}`}
            >
              <div className={s.actions}>
                <h2>Lote {lot.code}</h2>
                <button
                  onClick={() => setSelected(undefined)}
                  aria-label="Cerrar ficha"
                >
                  <X size={15} />
                </button>
              </div>
              <span style={{ color: LOT_COLORS[lot.status], fontWeight: 700 }}>
                {LOT_LABELS[lot.status]}
              </span>
              <p>
                {[lot.block && `Manzana ${lot.block}`, lot.street, lot.address]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
              <div className={s.grid}>
                <div className={s.metric}>
                  Área<strong>{lot.areaM2} m²</strong>
                </div>
                <div className={s.metric}>
                  Perímetro<strong>{lot.perimeterM} m</strong>
                </div>
                <div className={s.metric}>
                  Dimensiones<strong>{lot.dimensions || "Consultar"}</strong>
                </div>
                <div className={s.metric}>
                  Frente<strong>{lot.frontM || "—"} m</strong>
                </div>
              </div>
              {lot.type && <p>Tipo: {lot.type}</p>}
              {lot.cashAllowed && (
                <div className={s.notice}>
                  <p>Precio al contado</p>
                  <strong className="text-xl">{money(lot.price)}</strong>
                  <p>{money(lot.priceM2)} / m²</p>
                </div>
              )}
              {lot.financingAllowed && (
                <div className={s.notice}>
                  <strong>Financiamiento disponible</strong>
                  <p>Total: {money(lot.interestRateMonthly ? lot.downPayment + lot.installments * lot.monthlyPayment : lot.financedPrice)}</p>
                  {!!lot.interestRateMonthly && <p>Tasa mensual: {lot.interestRateMonthly}%</p>}
                  <p>Inicial: {money(lot.downPayment)}</p>
                  <p>
                    {lot.installments} cuotas de {money(lot.monthlyPayment)}
                  </p>
                </div>
              )}
              {lot.notes && <p>{lot.notes}</p>}
              <ProtectedLotPdfDownload
                className={s.button}
                slug={slug}
                lotId={lot.id}
                code={accessCode}
              />
              <p className={s.muted}>
                Disponibilidad y condiciones sujetas a confirmación.
              </p>
            </article>
          )}
          <section className={s.card}>
            <h2>Resumen del proyecto</h2>
            <div className={s.grid}>
              <div className={s.metric}>
                Lotes<strong>{plan.lots.length}</strong>
              </div>
              <div className={s.metric}>
                Área total
                <strong>
                  {plan.lots
                    .reduce((n, item) => n + item.areaM2, 0)
                    .toLocaleString("es-PE")}{" "}
                  m²
                </strong>
              </div>
              {Object.entries(LOT_LABELS).map(([status, label]) => (
                <div key={status} className={s.metric}>
                  {label}
                  <strong
                    style={{
                      color: LOT_COLORS[status as keyof typeof LOT_COLORS],
                    }}
                  >
                    {plan.lots.filter((l) => l.status === status).length}
                  </strong>
                </div>
              ))}
            </div>
          </section>
          <section className={`${s.card} ${s.fields}`}>
            <h2>Base de lotes · {plan.lots.length} lotes</h2>
            <label>
              Buscar lote
              <input
                placeholder="Código, manzana, calle"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </label>
            <label>
              Disponibilidad
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="ALL">Todos los estados</option>
                {Object.entries(LOT_LABELS).map(([value, label]) => (
                  <option value={value} key={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <div className={s.list}>
              {filtered.map((item) => (
                <button
                  className={s.row}
                  key={item.id}
                  onClick={() => setSelected(item.id)}
                >
                  <span>
                    <i style={{ color: LOT_COLORS[item.status] }}>● </i>
                    {item.block && `Mz. ${item.block} · `}
                    {item.code}
                    <small>
                      {item.areaM2} m² · {item.dimensions || "Ver dimensiones"}
                    </small>
                  </span>
                  <span>
                    {LOT_LABELS[item.status]}
                    <small>
                      {item.cashAllowed ? money(item.price) : "Financiado"}
                    </small>
                  </span>
                </button>
              ))}
            </div>
          </section>
          <section className={s.card}>
            <h2>Manzanas y calles</h2>
            <div className={s.list}>
              {plan.zones.map((zone) => (
                <button
                  className={s.row}
                  key={zone.id}
                  onClick={() => setSelected(zone.id)}
                >
                  <span>
                    {zone.name}
                    <small>{zone.kind === "BLOCK" ? "Manzana" : "Calle"}</small>
                  </span>
                  <span>
                    {
                      plan.lots.filter((l) =>
                        zone.kind === "BLOCK"
                          ? l.block === zone.name
                          : l.street === zone.name,
                      ).length
                    }{" "}
                    lotes
                  </span>
                </button>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </section>
  );
}
