"use client";

import { useState } from "react";
import { geoToImage } from "@/shared/lib/plan-coordinates";
import {
  LOT_LABELS,
  LOT_COLORS,
  type SitePlan,
  type PlanLot,
} from "@/shared/lib/site-plan";
import { env } from "@/shared/lib/env";
import s from "./site-plan.module.css";

export function AdminLotDetail({
  projectId,
  plan,
  lot,
  currency,
  onView,
  onClose,
}: {
  projectId: string;
  plan: SitePlan;
  lot: PlanLot;
  currency: "PEN" | "USD";
  onView: () => void;
  onClose: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const money = (n: number) =>
    new Intl.NumberFormat("es-PE", { style: "currency", currency }).format(n);
  const image = plan.image;
  const imageHeight = image ? 1000 * image.heightM / image.widthM : 1000;
  const normalized = image ? lot.path.map((p) => geoToImage(p, image)) : [];
  const minX = normalized.length ? Math.min(...normalized.map((p) => p.x)) : 0;
  const minY = normalized.length ? Math.min(...normalized.map((p) => p.y)) : 0;
  const maxX = normalized.length ? Math.max(...normalized.map((p) => p.x)) : 1;
  const maxY = normalized.length ? Math.max(...normalized.map((p) => p.y)) : 1;
  const padding = Math.max(maxX - minX, maxY - minY, 0.02) * 0.8;
  const rows = [
    ["Número de lote", lot.code],
    ["Dirección", lot.address || lot.street || "Sin especificar"],
    ["Manzana", lot.block || "—"],
    ["Tipo", lot.type || "—"],
    ["Estado", LOT_LABELS[lot.status]],
    ["Área", `${lot.areaM2} m²`],
    ["Perímetro", `${lot.perimeterM} m`],
    ["Dimensiones", lot.dimensions || "Sin especificar"],
    ["Frente", `${lot.frontM} m`],
    ["Precio por m²", money(lot.priceM2)],
    ["Precio al contado", lot.cashAllowed ? money(lot.price) : "No disponible"],
  ];
  async function download() {
    setBusy(true);
    setError("");
    try {
      const snapshot = {
        ...plan,
        lots: plan.lots.some((l) => l.id === lot.id)
          ? plan.lots.map((l) => (l.id === lot.id ? lot : l))
          : [...plan.lots, lot],
      };
      const response = await fetch(
        `${env.apiUrl}/admin/projects/${projectId}/site-plan/lots/${lot.id}/pdf`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(snapshot),
        },
      );
      if (!response.ok) {
        const body = await response.json();
        throw new Error(
          Array.isArray(body.message)
            ? body.message.join(" ")
            : body.message || "No se pudo descargar la ficha",
        );
      }
      const url = URL.createObjectURL(await response.blob());
      const a = document.createElement("a");
      a.href = url;
      a.download = `ficha-lote-${lot.code.replace(/[^a-zA-Z0-9_-]/g, "_")}.pdf`;
      document.body.append(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "No se pudo descargar la ficha",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <article
      className={`${s.card} ${s.fields}`}
      aria-label={`Detalle del lote ${lot.code}`}
    >
      <div className={s.actions}>
        <div>
          <p className={s.muted}>DETALLE DEL LOTE</p>
          <h2>Lote {lot.code}</h2>
        </div>
        <span style={{ color: LOT_COLORS[lot.status], fontWeight: 700 }}>
          {LOT_LABELS[lot.status]}
        </span>
        <button
          type="button"
          aria-label="Cerrar ficha del lote"
          onClick={onClose}
        >
          ✕
        </button>
      </div>
      <p>
        {[lot.street, lot.address, lot.block && `Mz. ${lot.block}`]
          .filter(Boolean)
          .join(" · ")}
      </p>
      <div className={s.actions}>
        <button
          type="button"
          className={s.primary}
          disabled={busy}
          onClick={download}
        >
          {busy ? "Generando PDF…" : "Descargar ficha PDF"}
        </button>
        <button type="button" onClick={onView}>
          Ver en plano
        </button>
      </div>
      {error && (
        <p role="alert" className={s.error}>
          {error}
        </p>
      )}
      <table className={s.table}>
        <tbody>
          {rows.map(([label, value]) => (
            <tr key={label}>
              <th>{label}</th>
              <td>{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {lot.financingAllowed && (
        <div className={s.notice}>
          <strong>Financiamiento disponible</strong>
          <p>Precio: {money(lot.financedPrice)}</p>
          <p>Inicial: {money(lot.downPayment)}</p>
          {!!lot.interestRateMonthly && <>
            <p>Tasa mensual: {lot.interestRateMonthly}%</p>
            <p>Total con intereses: {money(lot.downPayment + lot.installments * lot.monthlyPayment)}</p>
          </>}
          <p>
            {lot.installments} cuotas de {money(lot.monthlyPayment)}
          </p>
        </div>
      )}
      {image && normalized.length > 0 && (
        <div>
          <h2>Ubicación real en el plano</h2>
          <p className={s.muted}>Lote {lot.code} resaltado</p>
          <svg
            className="mt-2 w-full rounded-xl border border-edge bg-slate-100"
            style={{ height: 270 }}
            viewBox={`${(minX - padding) * 1000} ${(minY - padding) * imageHeight} ${(maxX - minX + padding * 2) * 1000} ${(maxY - minY + padding * 2) * imageHeight}`}
            preserveAspectRatio="xMidYMid meet"
            role="img"
            aria-label={`Lote ${lot.code} resaltado sobre el plano`}
          >
            <image
              href={image.url}
              width="1000"
              height={imageHeight}
              preserveAspectRatio="none"
            />
            <polygon
              points={normalized
                .map((p) => `${p.x * 1000},${p.y * imageHeight}`)
                .join(" ")}
              fill={LOT_COLORS[lot.status]}
              fillOpacity="0.45"
              stroke="#dc2626"
              strokeWidth="3"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </div>
      )}
      {lot.notes && <p>{lot.notes}</p>}
      <p className={s.muted}>
        Vista administrativa. El PDF refleja estos datos como borrador;
        descargarlo no publica cambios.
      </p>
    </article>
  );
}
