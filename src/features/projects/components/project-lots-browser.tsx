"use client";

import { useMemo, useState } from "react";
import { FileDown, MapPinned, Ruler, X } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { WhatsappIcon } from "@/shared/ui/icons";
import { cn } from "@/shared/lib/cn";
import { formatPrice } from "@/shared/lib/format";
import type { ApiCurrency, ApiLotMode, ProjectApiLot } from "@/features/projects/types/api";

const LOT_STATUS_LABEL: Record<string, string> = {
  AVAILABLE: "Disponible",
  RESERVED: "Reservado",
  SOLD: "Vendido",
  BLOCKED: "Bloqueado",
};

interface ProjectLotsBrowserProps {
  lots: ProjectApiLot[];
  lotMode: ApiLotMode;
  currency: ApiCurrency;
  projectName: string;
  locationLine: string;
  developer?: string | null;
  businessName?: string | null;
}

export function ProjectLotsBrowser({
  lots,
  lotMode,
  currency,
  projectName,
  locationLine,
  developer,
  businessName,
}: ProjectLotsBrowserProps) {
  const [selectedLot, setSelectedLot] = useState<ProjectApiLot | null>(null);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [blockFilter, setBlockFilter] = useState("ALL");
  const isGroup = lotMode === "GROUP";
  const title = isGroup ? "Grupos de lotes" : "Lotes individuales";
  const summary = isGroup
    ? "Cada card representa un grupo con lotes similares. Desliza hacia la derecha para ver todos."
    : "Cada card representa un lote individual. Desliza hacia la derecha para revisar el inventario.";
  const availableCount = useMemo(
    () => lots.filter((lot) => lot.status === "AVAILABLE").reduce((sum, lot) => sum + (isGroup ? lot.lotCount ?? 1 : 1), 0),
    [isGroup, lots],
  );
  const blocks = useMemo(
    () => [...new Set(lots.map((lot) => lot.block).filter((block): block is string => Boolean(block)))],
    [lots],
  );
  const filteredLots = lots.filter((lot) => {
    const matchesStatus = statusFilter === "ALL" || lot.status === statusFilter;
    const matchesBlock = blockFilter === "ALL" || lot.block === blockFilter;
    return matchesStatus && matchesBlock;
  });

  return (
    <section className="mt-9">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-accent">
            Inventario
          </p>
          <h2 className="mt-1 font-display text-xl font-black tracking-tight text-brand lg:text-2xl">
            {title}
          </h2>
          <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-muted">
            {summary}
          </p>
        </div>
        <div className="rounded-card border border-edge bg-surface px-4 py-3 text-sm font-black text-brand shadow-[var(--shadow-card)]">
          {availableCount.toLocaleString("es-PE")} disponibles
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-edge bg-surface p-4 shadow-[var(--shadow-card)]">
        <div className="horizontal-scrollbar-hidden flex gap-2 overflow-x-auto pb-1">
          {[
            { value: "ALL", label: "Todos" },
            { value: "AVAILABLE", label: "En venta" },
            { value: "RESERVED", label: "Reservados" },
            { value: "SOLD", label: "Vendidos" },
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setStatusFilter(option.value)}
              className={cn(
                "h-11 shrink-0 rounded-card px-4 text-sm font-black transition-colors",
                statusFilter === option.value
                  ? "bg-brand-soft text-brand shadow-[inset_0_-2px_0_var(--accent)]"
                  : "text-muted hover:bg-surface-muted hover:text-ink",
              )}
            >
              {option.label}
            </button>
          ))}
          {blocks.map((block) => (
            <button
              key={block}
              type="button"
              onClick={() => setBlockFilter(blockFilter === block ? "ALL" : block)}
              className={cn(
                "h-11 shrink-0 rounded-card px-4 text-sm font-black transition-colors",
                blockFilter === block
                  ? "bg-brand text-on-brand"
                  : "text-muted hover:bg-surface-muted hover:text-ink",
              )}
            >
              Mz. {block}
            </button>
          ))}
        </div>

        <p className="mt-4 text-base font-black text-brand">
          {statusFilter === "AVAILABLE" ? "En venta" : LOT_STATUS_LABEL[statusFilter] ?? "Inventario"} / {filteredLots.length} {filteredLots.length === 1 ? "ficha" : "fichas"}
        </p>

        <div className="horizontal-scrollbar-hidden mt-4 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1">
        {filteredLots.map((lot) => (
          <button
            key={lot.id}
            type="button"
            onClick={() => setSelectedLot(lot)}
            className="group w-[230px] shrink-0 snap-start overflow-hidden rounded-card border border-edge bg-white text-left transition duration-200 hover:-translate-y-0.5 hover:border-brand xl:w-[245px]"
          >
            <div className="flex h-20 items-center justify-center border-b border-edge bg-[linear-gradient(135deg,#f7f8fb_0%,#e9eef8_100%)] p-3">
              <div className="grid size-12 place-items-center rounded-xl bg-white text-brand shadow-[var(--shadow-card)]">
                <Ruler className="size-6" strokeWidth={2.1} />
              </div>
            </div>

            <div className="p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold text-brand">
                    {isGroup ? "Grupo de lotes" : "Lote"}
                  </p>
                  <h3 className="mt-1 font-display text-2xl font-black leading-none text-ink">
                    {lot.lotNumber}
                  </h3>
                </div>
                <StatusBadge status={lot.status} />
              </div>

              {lot.block ? <p className="mt-2 text-[11px] font-bold text-muted">Manzana {lot.block}</p> : null}
              {isGroup ? (
                <p className="mt-1 text-xs font-semibold text-ink">{lot.lotCount ?? 1} lotes similares</p>
              ) : null}
              <p className="mt-2 text-xl font-black text-ink">{formatPrice(lot.price, currency)}</p>
              <p className="mt-1 text-xs font-semibold text-muted">
                {lot.areaM2} m² {lot.frontM ? ` · ${lot.frontM} m frente` : ""}
              </p>

              <div className="mt-3 grid gap-2">
                <span className="inline-flex h-9 items-center justify-center gap-2 rounded-card bg-[#25D366] px-3 text-xs font-black text-white">
                  <WhatsappIcon className="size-4" />
                  Contactar
                </span>
                <span className="inline-flex h-9 items-center justify-center rounded-card bg-brand px-3 text-xs font-black text-on-brand">
                  Cotizar
                </span>
              </div>
            </div>
          </button>
        ))}
        </div>
      </div>

      {selectedLot ? (
        <LotModal
          lot={selectedLot}
          isGroup={isGroup}
          currency={currency}
          projectName={projectName}
          locationLine={locationLine}
          developer={developer}
          businessName={businessName}
          onClose={() => setSelectedLot(null)}
        />
      ) : null}
    </section>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "shrink-0 rounded-full px-2.5 py-1 text-[10px] font-black",
        status === "AVAILABLE" && "bg-success/10 text-success",
        status === "RESERVED" && "bg-warning/10 text-warning",
        status === "SOLD" && "bg-ink/10 text-muted",
        status === "BLOCKED" && "bg-ink/10 text-muted",
      )}
    >
      {LOT_STATUS_LABEL[status] ?? status}
    </span>
  );
}

function LotModal({
  lot,
  isGroup,
  currency,
  projectName,
  locationLine,
  developer,
  businessName,
  onClose,
}: {
  lot: ProjectApiLot;
  isGroup: boolean;
  currency: ApiCurrency;
  projectName: string;
  locationLine: string;
  developer?: string | null;
  businessName?: string | null;
  onClose: () => void;
}) {
  const company = businessName || developer || "ARIZ Proyectos";

  function printSheet() {
    const html = buildLotSheetHtml({
      lot,
      isGroup,
      currency,
      projectName,
      locationLine,
      company,
      logoUrl: `${window.location.origin}/logo/logo.png`,
    });
    const frame = document.createElement("iframe");
    frame.style.position = "fixed";
    frame.style.right = "0";
    frame.style.bottom = "0";
    frame.style.width = "0";
    frame.style.height = "0";
    frame.style.border = "0";
    document.body.appendChild(frame);
    frame.contentDocument?.open();
    frame.contentDocument?.write(html);
    frame.contentDocument?.close();
    frame.onload = () => {
      frame.contentWindow?.focus();
      frame.contentWindow?.print();
      window.setTimeout(() => frame.remove(), 1000);
    };
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-brand/45 p-4 backdrop-blur-sm" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="max-h-[calc(100dvh-2rem)] w-full max-w-xl overflow-hidden rounded-card border border-edge bg-surface shadow-[var(--shadow-pop)]">
        <div className="flex items-start justify-between gap-4 border-b border-edge p-5">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.16em] text-accent">
              Ficha {isGroup ? "del grupo" : "del lote"}
            </p>
            <h2 className="mt-1 font-display text-3xl font-black text-brand">
              {isGroup ? "Grupo" : "Lote"} {lot.lotNumber}
            </h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-2 text-muted hover:bg-surface-muted hover:text-ink" aria-label="Cerrar">
            <X className="size-5" />
          </button>
        </div>

        <div className="max-h-[calc(100dvh-12rem)] overflow-y-auto p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <InfoCard label="Proyecto" value={projectName} />
            <InfoCard label="Empresa" value={company} />
            <InfoCard label={isGroup ? "Grupo" : "Lote"} value={lot.lotNumber} />
            <InfoCard label="Manzana" value={lot.block ?? "Por confirmar"} />
            {isGroup ? <InfoCard label="Cantidad" value={`${lot.lotCount ?? 1} lotes similares`} /> : null}
            <InfoCard label={isGroup ? "Area por lote" : "Area"} value={`${lot.areaM2} m²`} />
            <InfoCard label="Frente" value={lot.frontM ? `${lot.frontM} m` : "Por confirmar"} />
            <InfoCard label={isGroup ? "Precio por lote" : "Precio"} value={formatPrice(lot.price, currency)} strong />
            <InfoCard label="Estado" value={LOT_STATUS_LABEL[lot.status] ?? lot.status} />
            <InfoCard label="Ubicacion interna" value={lot.planLocation ?? "Por confirmar"} />
          </div>

          <div className="mt-4 rounded-card border border-edge bg-canvas p-4">
            <p className="flex items-start gap-2 text-sm font-semibold leading-6 text-muted">
              <MapPinned className="mt-0.5 size-4 shrink-0 text-accent" />
              {locationLine || "Ubicacion por confirmar"}
            </p>
            <p className="mt-3 flex items-start gap-2 text-sm font-semibold leading-6 text-muted">
              <Ruler className="mt-0.5 size-4 shrink-0 text-accent" />
              La ficha descargable incluye dimensiones, precio, estado, ubicacion y empresa responsable.
            </p>
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Button type="button" onClick={printSheet} className="flex-1">
              <FileDown className="size-4" />
              Imprimir PDF
            </Button>
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
              Cerrar
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

function InfoCard({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="rounded-card border border-edge bg-white p-3">
      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-muted">{label}</p>
      <p className={cn("mt-1 text-sm font-bold text-ink", strong && "text-lg font-black text-brand")}>{value}</p>
    </div>
  );
}

function buildLotSheetHtml({
  lot,
  isGroup,
  currency,
  projectName,
  locationLine,
  company,
  logoUrl,
}: {
  lot: ProjectApiLot;
  isGroup: boolean;
  currency: ApiCurrency;
  projectName: string;
  locationLine: string;
  company: string;
  logoUrl: string;
}) {
  const rows = [
    ["Proyecto", projectName],
    ["Empresa", company],
    [isGroup ? "Grupo" : "Lote", lot.lotNumber],
    ["Manzana", lot.block ?? "Por confirmar"],
    ...(isGroup ? [["Cantidad", `${lot.lotCount ?? 1} lotes similares`]] : []),
    [isGroup ? "Area por lote" : "Area", `${lot.areaM2} m²`],
    ["Frente", lot.frontM ? `${lot.frontM} m` : "Por confirmar"],
    [isGroup ? "Precio por lote" : "Precio", formatPrice(lot.price, currency)],
    ["Estado", LOT_STATUS_LABEL[lot.status] ?? lot.status],
    ["Ubicacion interna", lot.planLocation ?? "Por confirmar"],
    ["Lugar", locationLine || "Por confirmar"],
  ];

  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <title>Ficha ${isGroup ? "grupo" : "lote"} ${escapeHtml(lot.lotNumber)} - ${escapeHtml(projectName)}</title>
  <style>
    @page{size:A4;margin:18mm}
    *{box-sizing:border-box}
    body{font-family:Arial,sans-serif;margin:0;color:#0b1437;background:#f5f6fa}
    .sheet{max-width:760px;margin:auto;background:white;border:1px solid #d9deea;border-radius:18px;overflow:hidden}
    header{background:#071A5A;color:white;padding:28px}
    .top{display:flex;align-items:center;justify-content:space-between;gap:20px}
    .logo{height:54px;width:auto;border-radius:8px;background:white;padding:7px}
    h1{margin:18px 0 0;font-size:34px;line-height:1}.eyebrow{margin:0;color:#f2a900;font-weight:800;text-transform:uppercase;letter-spacing:.12em;font-size:12px}
    .meta{margin:10px 0 0;color:rgba(255,255,255,.78);font-weight:700}
    table{width:100%;border-collapse:collapse}td{padding:15px 22px;border-top:1px solid #e5e7ef}td:first-child{color:#646d8a;font-weight:800;width:38%}td:last-child{font-weight:800}
    footer{padding:20px 22px;color:#646d8a;font-size:12px;line-height:1.6;background:#f7f8fb}
    @media print{body{background:white}.sheet{border-radius:0;border:0}}
  </style>
</head>
<body>
  <main class="sheet">
    <header>
      <div class="top">
        <div>
          <p class="eyebrow">Ficha ${isGroup ? "del grupo" : "del lote"}</p>
          <h1>${escapeHtml(isGroup ? "Grupo" : "Lote")} ${escapeHtml(lot.lotNumber)}</h1>
          <p class="meta">${escapeHtml(projectName)}</p>
        </div>
        <img class="logo" src="${escapeHtml(logoUrl)}" alt="ARIZ" />
      </div>
    </header>
    <table><tbody>${rows.map(([label, value]) => `<tr><td>${escapeHtml(label)}</td><td>${escapeHtml(value)}</td></tr>`).join("")}</tbody></table>
    <footer>Ficha generada desde ARIZ Proyectos. Valida disponibilidad y condiciones con el asesor antes de separar.</footer>
  </main>
</body>
</html>`;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
