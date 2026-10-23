"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { SitePlanMap } from "@/shared/ui/site-plan-map";
import { LOT_LABELS, type SitePlan, type Point } from "@/shared/lib/site-plan";
import { apiClient } from "@/shared/lib/api/client";
import { PublicPlanAccess } from "@/shared/ui/public-plan-access";
import { ProtectedLotPdfDownload } from "@/shared/ui/protected-lot-pdf-download";
import { buildArizWhatsappUrl } from "@/shared/lib/whatsapp";
type MapPoint = Point & {
  id: string;
  title: string;
  priceLabel: string;
  districtLabel: string;
  href: string;
};
type ListingsMapProps = {
  points: readonly MapPoint[];
  center?: [number, number];
  className?: string;
  activeId?: string | null;
  onSelect?: (id: string) => void;
};

type LoadedPlan = {
  plan: SitePlan & { currency?: "PEN" | "USD" };
  point: MapPoint;
  slug: string;
};
const EMPTY: SitePlan = { logoUrl: "", zones: [], lots: [] };

/** Loads nearby published plans only when the visitor zooms into a project. */
export function GoogleListingsMap({
  points,
  center = [-12.046374, -77.042793],
  className,
  activeId,
  onSelect,
}: ListingsMapProps) {
  const [view, setView] = useState<{ center: Point; zoom: number }>({
    center: { lat: center[0], lng: center[1] },
    zoom: 0,
  });
  const [loaded, setLoaded] = useState<LoadedPlan[]>([]);
  const [selectedLot, setSelectedLot] = useState<string>();
  const [showImage, setShowImage] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [accessCodes, setAccessCodes] = useState<Record<string, string>>({});
  const [invalidCodes, setInvalidCodes] = useState<Record<string, boolean>>({});
  const [omittedCodes, setOmittedCodes] = useState<Record<string, boolean>>({});
  const cache = useRef(new Map<string, Promise<LoadedPlan | null>>());
  const [centerLat, centerLng] = center;
  const centerPoint = useMemo(
    () => ({ lat: centerLat, lng: centerLng }),
    [centerLat, centerLng],
  );
  const markers = useMemo(
    () =>
      points.map((point) => ({
        id: point.id,
        lat: point.lat,
        lng: point.lng,
        title: point.title,
        priceLabel: point.priceLabel,
      })),
    [points],
  );
  useEffect(() => {
    if (view.zoom < 15) return;
    let alive = true;
    const candidates = points
      .filter(
        (point) =>
          point.href.startsWith("/project/") &&
          Math.abs(point.lat - view.center.lat) < 0.04 &&
          Math.abs(point.lng - view.center.lng) < 0.04,
      )
      .sort(
        (a, b) =>
          Math.hypot(a.lat - view.center.lat, a.lng - view.center.lng) -
          Math.hypot(b.lat - view.center.lat, b.lng - view.center.lng),
      )
      .slice(0, 4);
    const unlockedCandidates = candidates.filter(point => {
      const slug = decodeURIComponent(point.href.split("/project/")[1].split(/[?#]/)[0]);
      return Boolean(accessCodes[point.id] || accessCodes[slug]);
    });
    const requests = unlockedCandidates.map((point) => {
      const slug = decodeURIComponent(
        point.href.split("/project/")[1].split(/[?#]/)[0],
      );
      const code = accessCodes[point.id] ?? accessCodes[slug];
      if (!cache.current.has(slug))
        cache.current.set(
          slug,
          apiClient
            .get<LoadedPlan["plan"] | null>(
              `/projects/${encodeURIComponent(slug)}/site-plan`,
              { cache: "no-store", headers: code ? { "X-Site-Plan-Code": code } : undefined },
            )
            .then((plan) => {
              if (plan) setInvalidCodes(previous => ({ ...previous, [point.id]: false }));
              return plan ? { plan, point, slug } : null;
            })
            .catch((error) => {
              cache.current.delete(slug);
              if (error instanceof Error && "status" in error && error.status === 403)
                setInvalidCodes(previous => ({ ...previous, [point.id]: true }));
              throw error;
            }),
        );
      return cache.current.get(slug)!;
    });
    Promise.all(requests)
      .then((plans) => {
        if (alive) {
          setLoaded(plans.filter((plan): plan is LoadedPlan => Boolean(plan)));
          setLoadError(false);
        }
      })
      .catch(() => {
        if (alive) setLoadError(true);
      });
    return () => {
      alive = false;
    };
  }, [points, view, accessCodes]);
  const visible = view.zoom >= 15 ? loaded : [];
  const combined = useMemo<SitePlan>(
    () => ({
      ...EMPTY,
      lots: loaded.flatMap((item) => item.plan.lots),
      zones: loaded.flatMap((item) => item.plan.zones),
    }),
    [loaded],
  );
  const images = useMemo(
    () => loaded.flatMap((item) => (item.plan.image ? [item.plan.image] : [])),
    [loaded],
  );
  const owner = visible.find((item) =>
    item.plan.lots.some((lot) => lot.id === selectedLot),
  );
  const lot = owner?.plan.lots.find((item) => item.id === selectedLot);
  const money = (value: number) =>
    new Intl.NumberFormat("es-PE", {
      style: "currency",
      currency:
        owner?.plan.currency ??
        (owner?.point.priceLabel.includes("$") ? "USD" : "PEN"),
    }).format(value);
  const active = points.find((point) => point.id === activeId);
  return (
    <div className={`relative ${className ?? "min-h-[500px]"}`}>
      <SitePlanMap
        plan={view.zoom >= 15 ? combined : EMPTY}
        images={view.zoom >= 15 ? images : undefined}
        center={centerPoint}
        className="h-full min-h-[360px]"
        showImage={showImage}
        publicView
        markers={markers}
        markerFocusId={activeId}
        onMarkerSelect={(id) => {
          setSelectedLot(undefined);
          onSelect?.(id);
        }}
        onViewport={setView}
        selected={selectedLot}
        onSelect={setSelectedLot}
      />
      {visible.some((item) => item.plan.image) && (
        <button
          className="absolute right-3 top-16 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-800 shadow"
          onClick={() => setShowImage(!showImage)}
        >
          {showImage ? "Ocultar imagen del plano" : "Mostrar imagen del plano"}
        </button>
      )}
      {loadError && (
        <p
          role="status"
          className="absolute left-3 top-3 rounded-xl bg-white p-3 text-xs text-red-700"
        >
          No se pudo cargar el plano del proyecto. Acércate de nuevo para
          reintentar.
        </p>
      )}
      {lot && owner ? (
        <article className="absolute bottom-20 right-3 z-10 max-h-[70%] w-[min(320px,calc(100%-24px))] overflow-auto rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-800 shadow-xl">
          <button
            className="float-right p-1"
            aria-label="Cerrar ficha del lote"
            onClick={() => setSelectedLot(undefined)}
          >
            ✕
          </button>
          <h3 className="font-bold">Lote {lot.code}</h3>
          <p className="mt-1 text-xs text-slate-500">
            {owner.point.title} · {LOT_LABELS[lot.status]}
          </p>
          <p className="mt-3">
            {[lot.block && `Mz. ${lot.block}`, lot.street]
              .filter(Boolean)
              .join(" · ")}
          </p>
          <p>
            {lot.areaM2} m² · Perímetro: {lot.perimeterM} m
          </p>
          <p>
            {lot.dimensions || "Dimensiones por confirmar"} · Frente:{" "}
            {lot.frontM || "—"} m
          </p>
          {lot.cashAllowed && (
            <p className="mt-3 font-bold">Contado: {money(lot.price)}</p>
          )}
          {lot.financingAllowed && (
            <div className="mt-3 rounded-xl bg-blue-50 p-3">
              <p className="font-bold">
                Financiado: {money(lot.financedPrice)}
              </p>
              <p>Inicial: {money(lot.downPayment)}</p>
              <p>
                {lot.installments} cuotas de {money(lot.monthlyPayment)}
              </p>
            </div>
          )}
          <ProtectedLotPdfDownload
            className="mt-4 flex w-full justify-center rounded-xl bg-blue-600 px-3 py-2 text-center font-bold text-white"
            slug={owner.slug}
            lotId={lot.id}
            code={accessCodes[owner.point.id] ?? accessCodes[owner.slug] ?? ""}
          />
          <Link
            className="mt-3 block text-center text-xs font-bold text-blue-700"
            href={owner.point.href}
          >
            Ver proyecto completo
          </Link>
          {active && active.href.startsWith("/project/") && !loaded.some(item => item.point.id === active.id) && !omittedCodes[active.id] && (
            <div className="mt-3">
              <PublicPlanAccess
                invalid={!!invalidCodes[active.id]}
                onSubmit={code => {
                  setInvalidCodes(previous => ({ ...previous, [active.id]: false }));
                  setAccessCodes(previous => ({ ...previous, [active.id]: code }));
                }}
                onOmit={() => setOmittedCodes(previous => ({ ...previous, [active.id]: true }))}
                contactHref={buildArizWhatsappUrl(`Hola, quisiera coordinar con un asesor para obtener el código del proyecto ${active.title}.`)}
              />
            </div>
          )}
          {active && active.href.startsWith("/project/") && omittedCodes[active.id] && !loaded.some(item => item.point.id === active.id) && (
            <div className="mt-3 grid gap-2">
              <p className="text-xs text-slate-500">Se muestra la ubicación del proyecto. Se omitió el código y el plano permanece oculto.</p>
              <button
                type="button"
                className="text-left text-xs font-bold text-blue-700"
                onClick={() => setOmittedCodes(previous => ({ ...previous, [active.id]: false }))}
              >
                Ingresar código para ver el plano
              </button>
            </div>
          )}
        </article>
      ) : (
        active && (
          <article className="absolute bottom-20 right-3 z-10 w-[min(290px,calc(100%-24px))] rounded-2xl border border-slate-200 bg-white p-4 text-slate-800 shadow-xl">
            <h3 className="font-bold">{active.title}</h3>
            <p className="mt-1 text-sm font-bold text-blue-700">
              {active.priceLabel}
            </p>
            <p className="mt-1 text-xs">{active.districtLabel}</p>
            <Link
              href={active.href}
              className="mt-3 inline-block text-sm font-bold text-blue-700"
            >
              Ver ficha completa →
            </Link>
            <p className="mt-2 text-[11px] text-slate-500">
              Acércate para explorar los lotes del proyecto.
            </p>
          </article>
        )
      )}
    </div>
  );
}
