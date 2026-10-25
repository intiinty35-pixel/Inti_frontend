"use client";

import { useEffect, useRef, useState } from "react";
import { geoToImage, imageToGeo } from "@/shared/lib/plan-coordinates";
import { AVAILABLE_LOT_BORDER, LOT_COLORS, type PlanCrop, type Point, type SitePlan } from "@/shared/lib/site-plan";
import type { PlanTool } from "./site-plan-map";
import {
  LockKeyhole,
  UnlockKeyhole,
  Plus,
  Minus,
  RotateCcw,
} from "lucide-react";
import styles from "./site-plan-canvas.module.css";
import hoverStyles from "./site-plan-map.module.css";
import { lotHoverSummary } from "@/shared/lib/lot-hover-summary";
import { blockBadge, BLOCK_BADGE_SIZE } from "@/shared/lib/block-badge";
import { lotAnnotations } from "@/shared/lib/lot-annotations";
import { STREET_COLOR, STREET_MARKING, STREET_VERGE_COLOR, STREET_VERGE_WIDTH_M, streetCenterLine } from "@/shared/lib/street-design";
import { snapPlanPoint } from "@/shared/lib/snap-plan-point";
import { polygonLabel, fitPolygonText } from "@/shared/lib/polygon-label";

export function SitePlanCanvas({
  plan,
  tool,
  points,
  selected,
  showImage,
  onPoint,
  onSelect,
  onPath,
  onComplete,
  onCrop,
  previewPaths = [],
  previewLabels = [],
  currency,
  moveDrawing = false,
  onDrawingMove,
}: {
  plan: SitePlan;
  tool: PlanTool;
  points: Point[];
  selected?: string;
  showImage: boolean;
  onPoint: (point: Point) => void;
  onSelect: (id: string) => void;
  onPath: (id: string, path: Point[]) => void;
  onComplete?: (path: Point[]) => void;
  onCrop?: (selection: PlanCrop) => void;
  previewPaths?: Point[][];
  previewLabels?: string[];
  currency?: string;
  moveDrawing?: boolean;
  onDrawingMove?: (dx: number, dy: number) => void;
}) {
  const [hovered, setHovered] = useState<{ id: string; x: number; y: number }>();
  const hoveredLot = hovered && plan.lots.find(lot => lot.id === hovered.id);
  const hoverSummary = hoveredLot && lotHoverSummary(hoveredLot, currency);
  const [labelsReady, setLabelsReady] = useState(false);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setLabelsReady(true));
    return () => cancelAnimationFrame(frame);
  }, []);
  const svg = useRef<SVGSVGElement>(null);
  const drawingDrag = useRef<{ x: number; y: number } | null>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const pan = useRef<{
    x: number;
    y: number;
    left: number;
    top: number;
  } | null>(null);
  const [locked, setLocked] = useState(true);
  const [transforming, setTransforming] = useState(false);
  const dragging = useRef<number | null>(null);
  const drawStart = useRef<{ x: number; y: number; point: Point } | null>(null);
  const ignoreClick = useRef(false);
  const [rectangle, setRectangle] = useState<Point[]>([]);
  const [cropDraft, setCropDraft] = useState<PlanCrop | null>(null);
  const cropDrag = useRef<{ x: number; y: number; pointerId: number; selection: PlanCrop } | null>(null);
  const resizing = useRef<{
    x: number;
    y: number;
    zoom: number;
    halfWidth: number;
    halfHeight: number;
    handleX: number;
    handleY: number;
    offsetX: number;
    offsetY: number;
  } | null>(null);
  const [zoom, setZoom] = useState(1);
  const [snapMarker, setSnapMarker] = useState<Point>();
  const [failed, setFailed] = useState(false);
  const [loadedUrl, setLoadedUrl] = useState("");
  const image = plan.image;
  useEffect(() => {
    if (!image?.url) return;
    let alive = true;
    const probe = new Image();
    probe.onload = () => {
      if (alive) {
        setLoadedUrl(image.url);
        setFailed(false);
      }
    };
    probe.onerror = () => {
      if (alive) setFailed(true);
    };
    probe.src = image.url;
    return () => {
      alive = false;
    };
  }, [image?.url]);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [frame, setFrame] = useState({ width: 600, height: 600 });
  useEffect(() => {
    const node = viewport.current;
    if (!node) return;
    const resize = () => {
      const css = getComputedStyle(node);
      setFrame({
        width: Math.max(
          1,
          node.clientWidth -
            parseFloat(css.paddingLeft) -
            parseFloat(css.paddingRight),
        ),
        height: Math.max(
          1,
          node.clientHeight -
            parseFloat(css.paddingTop) -
            parseFloat(css.paddingBottom),
        ),
      });
    };
    const observer = new ResizeObserver(resize);
    observer.observe(node);
    resize();
    return () => observer.disconnect();
  }, [image?.url]);
  if (!image)
    return (
      <div className="grid min-h-[640px] place-items-center rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50 p-8 text-center">
        <div>
          <h2 className="text-lg font-bold text-slate-800">
            Primero carga el plano del proyecto
          </h2>
          <p className="mt-3 max-w-md text-sm text-slate-600">
            Usa «Subir plano» para cargar la imagen. Después podrás trazar las
            manzanas, calles y cada lote directamente sobre ella.
          </p>
        </div>
      </div>
    );
  const position = (point: Point) => {
    const p = geoToImage(point, image);
    return `${p.x * 1000},${p.y * 1000}`;
  };
  const renderedWidth =
    Math.min(frame.width, (frame.height * image.widthM) / image.heightM) * zoom;
  const renderedHeight = (renderedWidth * image.heightM) / image.widthM;
  const canCrop = Boolean(!moveDrawing && onCrop && showImage && !failed && loadedUrl === image.url && tool === "SELECT" && !points.length);
  const cropBounds = cropDraft ?? { left: 0, top: 0, right: 1, bottom: 1 };
  const cropHandles = [
    { x: -1, y: -1, label: "Esquina superior izquierda", cursor: "nwse-resize" },
    { x: 0, y: -1, label: "Borde superior", cursor: "ns-resize" },
    { x: 1, y: -1, label: "Esquina superior derecha", cursor: "nesw-resize" },
    { x: 1, y: 0, label: "Borde derecho", cursor: "ew-resize" },
    { x: 1, y: 1, label: "Esquina inferior derecha", cursor: "nwse-resize" },
    { x: 0, y: 1, label: "Borde inferior", cursor: "ns-resize" },
    { x: -1, y: 1, label: "Esquina inferior izquierda", cursor: "nesw-resize" },
    { x: -1, y: 0, label: "Borde izquierdo", cursor: "ew-resize" },
  ];
  function beginCrop(event: React.PointerEvent<HTMLButtonElement>) {
    event.preventDefault(); event.stopPropagation(); event.currentTarget.focus();
    cropDrag.current = { x: Number(event.currentTarget.dataset.cropX), y: Number(event.currentTarget.dataset.cropY), pointerId: event.pointerId, selection: { left: 0, top: 0, right: 1, bottom: 1 } };
    event.currentTarget.setPointerCapture(event.pointerId);
  }
  function dragCrop(event: React.PointerEvent<HTMLButtonElement>) {
    const drag = cropDrag.current, rect = svg.current?.getBoundingClientRect();
    if (!drag || !rect) return;
    event.stopPropagation();
    const x = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
    const selection = { ...drag.selection };
    if (drag.x < 0) selection.left = Math.min(x, selection.right - 1 / image!.widthM);
    if (drag.x > 0) selection.right = Math.max(x, selection.left + 1 / image!.widthM);
    if (drag.y < 0) selection.top = Math.min(y, selection.bottom - 1 / image!.heightM);
    if (drag.y > 0) selection.bottom = Math.max(y, selection.top + 1 / image!.heightM);
    drag.selection = selection; setCropDraft(selection);
  }
  function endCrop(event: React.PointerEvent<HTMLButtonElement>) {
    event.stopPropagation(); const drag = cropDrag.current; cropDrag.current = null; setCropDraft(null);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    if (drag && (drag.selection.left > 0 || drag.selection.top > 0 || drag.selection.right < 1 || drag.selection.bottom < 1)) onCrop?.(drag.selection);
  }
  function cancelCrop() { cropDrag.current = null; setCropDraft(null); }
  function cropKey(event: React.KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "Escape") { cancelCrop(); return; }
    const selection = { left: 0, top: 0, right: 1, bottom: 1 };
    const dx = event.key === "ArrowRight" ? .01 : event.key === "ArrowLeft" ? -.01 : 0;
    const dy = event.key === "ArrowDown" ? .01 : event.key === "ArrowUp" ? -.01 : 0;
    if (!dx && !dy) return;
    event.preventDefault();
    const x = Number(event.currentTarget.dataset.cropX), y = Number(event.currentTarget.dataset.cropY);
    if (x < 0 && dx > 0) selection.left = dx;
    if (x > 0 && dx < 0) selection.right += dx;
    if (y < 0 && dy > 0) selection.top = dy;
    if (y > 0 && dy < 0) selection.bottom += dy;
    if (selection.left || selection.top || selection.right < 1 || selection.bottom < 1) onCrop?.(selection);
  }
  function beginResize(event: React.PointerEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    setTransforming(true);
    resizing.current = {
      x: event.clientX,
      y: event.clientY,
      zoom,
      halfWidth: renderedWidth / 2,
      halfHeight: renderedHeight / 2,
      handleX: Number(event.currentTarget.dataset.handleX),
      handleY: Number(event.currentTarget.dataset.handleY),
      offsetX: offset.x,
      offsetY: offset.y,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }
  function dragResize(event: React.PointerEvent<HTMLButtonElement>) {
    const start = resizing.current;
    if (!start) return;
    event.stopPropagation();
    const axisX = start.halfWidth * 2 * start.handleX;
    const axisY = start.halfHeight * 2 * start.handleY;
    const ratio =
      1 +
      ((event.clientX - start.x) * axisX + (event.clientY - start.y) * axisY) /
        (axisX ** 2 + axisY ** 2);
    const nextZoom = Math.max(0.25, Math.min(12, start.zoom * ratio));
    const scale = nextZoom / start.zoom;
    setZoom(nextZoom);
    setOffset({
      x: start.offsetX + start.handleX * start.halfWidth * (scale - 1),
      y: start.offsetY + start.handleY * start.halfHeight * (scale - 1),
    });
  }
  function endResize(event: React.PointerEvent<HTMLButtonElement>) {
    event.stopPropagation();
    resizing.current = null;
    setTransforming(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId);
  }
  function cancelResize() {
    resizing.current = null;
    setTransforming(false);
  }
  const shapes = [
    ...plan.zones.map((z) => ({
      ...z,
      lot: undefined,
      label: z.kind === "CONTOUR" ? "" : z.name,
      contour: z.kind === "CONTOUR",
      color: z.kind === "CONTOUR" ? "#0ea5e9" : z.kind === "PARK" ? "#4d7c0f" : z.kind === "BLOCK" ? "#3b82f6" : "#92400e",
      zone: true,
    })),
    ...plan.lots
      .filter((l) => l.path.length >= 3)
      .map((l) => ({
        ...l,
        lot: l,
        label: l.code,
        color: LOT_COLORS[l.status],
        zone: false,
        contour: false,
      })),
  ];
  const active = shapes.find((shape) => shape.id === selected);
  const snapPaths = [
    ...plan.lots.filter(l => l.id !== selected && l.path.length >= 3).map(l => l.path),
    ...plan.zones.filter(z => z.id !== selected && (z.kind === "BLOCK" || z.kind === "STREET")).map(z => z.path),
  ];
  const snap = (point: Point, disabled = false) => {
    if (disabled || (tool !== "LOT" && tool !== "GROUP" && tool !== "STREET" && tool !== "BLOCK" && !(tool === "SELECT" && active && !active.contour))) return { point, snapped: false };
    const bounds = svg.current!.getBoundingClientRect();
    return snapPlanPoint(point, snapPaths, p => {
      const uv = geoToImage(p, image);
      return { x: uv.x * bounds.width, y: uv.y * bounds.height };
    });
  };
  const locate = (event: React.PointerEvent | React.MouseEvent) => {
    const rect = svg.current!.getBoundingClientRect();
    const raw = imageToGeo(
      {
        x: Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width)),
        y: Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height)),
      },
      image,
    );
    const result = snap(raw, event.shiftKey);
    setSnapMarker(result.snapped ? result.point : undefined);
    return result.point;
  };
  return (
    <div className="relative rounded-2xl border border-edge bg-slate-100">
      {hovered && hoverSummary && tool === "SELECT" && <div className={hoverStyles.lotTooltip}
        style={{ position: "fixed", left: Math.max(125, Math.min(window.innerWidth - 125, hovered.x)), top: Math.max(110, hovered.y - 16) }}>
        <strong>{hoverSummary.title}</strong>
        {hoverSummary.price && <span className={hoverStyles.lotTooltipPrice}>{hoverSummary.price}</span>}
        {hoverSummary.priceM2 && <span>{hoverSummary.priceM2}</span>}
        <span>{hoverSummary.detail}</span>
      </div>}
      <div className={styles.controls} aria-label="Controles del plano">
        <button
          type="button"
          aria-label="Acercar plano"
          title="Acercar plano"
          onClick={() => setZoom((z) => Math.min(12, z + 0.5))}
        >
          <Plus size={18} />
        </button>
        <button
          type="button"
          aria-label="Alejar plano"
          title="Alejar plano"
          onClick={() => setZoom((z) => Math.max(0.25, z - 0.25))}
        >
          <Minus size={18} />
        </button>
        <button
          type="button"
          aria-label={
            locked ? "Desbloquear desplazamiento del plano" : "Fijar plano"
          }
          title={locked ? "Plano fijo: pulsa para moverlo" : "Fijar plano"}
          aria-pressed={locked}
          className={locked ? styles.locked : ""}
          onClick={() => setLocked((value) => !value)}
        >
          {locked ? <LockKeyhole size={17} /> : <UnlockKeyhole size={17} />}
        </button>
        <button
          type="button"
          aria-label="Restablecer vista del plano"
          title="Restablecer vista"
          onClick={() => {
            setZoom(1);
            setOffset({ x: 0, y: 0 });
          }}
        >
          <RotateCcw size={17} />
        </button>
        <span>{Math.round(zoom * 100)}%</span>
      </div>
      {failed && (
        <p role="alert" className="bg-red-50 p-3 text-sm text-red-700">
          No se pudo cargar la imagen. Vuelve a subir el plano antes de dibujar.
        </p>
      )}
      <div
        ref={viewport}
        className={styles.viewport}
        data-transforming={transforming}
        style={{ cursor: !locked && tool === "SELECT" ? "grab" : undefined }}
        onPointerDown={(event) => {
          if (
            locked ||
            tool !== "SELECT" ||
            (event.target as Element).closest("button")
          )
            return;
          pan.current = {
            x: event.clientX,
            y: event.clientY,
            left: offset.x,
            top: offset.y,
          };
          setTransforming(true);
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          if (pan.current) {
            setOffset({
              x: pan.current.left + event.clientX - pan.current.x,
              y: pan.current.top + event.clientY - pan.current.y,
            });
          }
        }}
        onPointerUp={(event) => {
          if (pan.current && Math.hypot(event.clientX - pan.current.x, event.clientY - pan.current.y) > 5) ignoreClick.current = true;
          pan.current = null;
          setTransforming(false);
          if (event.currentTarget.hasPointerCapture(event.pointerId))
            event.currentTarget.releasePointerCapture(event.pointerId);
        }}
        onPointerCancel={() => {
          pan.current = null;
          setTransforming(false);
        }}
      >
        <svg
          ref={svg}
          viewBox="0 0 1000 1000"
          preserveAspectRatio="none"
          aria-label="Editor de dibujo sobre la imagen del plano"
          style={{
            display: "block",
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px))`,
            width:
              Math.min(
                frame.width,
                (frame.height * image.widthM) / image.heightM,
              ) * zoom,
            maxWidth: "none",
            aspectRatio: `${image.widthM} / ${image.heightM}`,
            background: "white",
            cursor: tool === "SELECT" ? "default" : "crosshair",
          }}
          onClick={(event) => {
            if (ignoreClick.current) {
              ignoreClick.current = false;
              return;
            }
            if (event.detail > 1) return;
            if (points.length >= 3) {
              const first = geoToImage(points[0], image);
              const bounds = event.currentTarget.getBoundingClientRect();
              if (
                Math.hypot(
                  event.clientX - bounds.left - first.x * bounds.width,
                  event.clientY - bounds.top - first.y * bounds.height,
                ) < 12
              ) {
                onComplete?.(points);
                return;
              }
            }
            if (
              showImage &&
              !failed &&
              loadedUrl === image.url &&
              tool !== "SELECT"
            )
              onPoint(locate(event));
          }}
          onDoubleClick={(event) => {
            if (tool !== "SELECT" && points.length >= 3) {
              event.preventDefault();
              onComplete?.(points);
            }
          }}
          onPointerDown={(event) => {
            if (
              tool === "SELECT" ||
              !showImage ||
              failed ||
              loadedUrl !== image.url ||
              event.button !== 0
            )
              return;
            drawStart.current = {
              x: event.clientX,
              y: event.clientY,
              point: locate(event),
            };
            event.currentTarget.setPointerCapture(event.pointerId);
          }}
          onPointerMove={(event) => {
            const start = drawStart.current;
            if (!start && tool !== "SELECT") locate(event);
            if (
              !start ||
              Math.hypot(event.clientX - start.x, event.clientY - start.y) < 6
            )
              return;
            const end = locate(event);
            const a = geoToImage(start.point, image),
              b = geoToImage(end, image);
            setRectangle([
              start.point,
              imageToGeo({ x: b.x, y: a.y }, image),
              end,
              imageToGeo({ x: a.x, y: b.y }, image),
            ]);
          }}
          onPointerUp={(event) => {
            const start = drawStart.current;
            drawStart.current = null;
            if (event.currentTarget.hasPointerCapture(event.pointerId))
              event.currentTarget.releasePointerCapture(event.pointerId);
            if (
              !start ||
              Math.hypot(event.clientX - start.x, event.clientY - start.y) < 6
            )
              return;
            const end = locate(event);
            const a = geoToImage(start.point, image),
              b = geoToImage(end, image);
            ignoreClick.current = true;
            setRectangle([]);
            onComplete?.([
              start.point,
              imageToGeo({ x: b.x, y: a.y }, image),
              end,
              imageToGeo({ x: a.x, y: b.y }, image),
            ].map(point => snap(point, event.shiftKey).point));
          }}
          onPointerCancel={() => {
            drawStart.current = null;
            setRectangle([]);
          }}
        >
          <svg width="1000" height="1000" viewBox={image.crop ? `${image.crop.left * 1000} ${image.crop.top * 1000} ${(image.crop.right - image.crop.left) * 1000} ${(image.crop.bottom - image.crop.top) * 1000}` : "0 0 1000 1000"} preserveAspectRatio="none" pointerEvents="none">
          <image
            key={image.url}
            href={image.url}
            width="1000"
            height="1000"
            preserveAspectRatio="none"
            opacity={showImage ? 1 : 0}
            onLoad={() => {
              setFailed(false);
              setLoadedUrl(image.url);
            }}
            onError={() => setFailed(true)}
            pointerEvents="none"
          />
          </svg>
          <g fill={STREET_VERGE_COLOR} stroke={STREET_VERGE_COLOR} strokeWidth={2 * STREET_VERGE_WIDTH_M * 1000 / image.widthM} strokeLinejoin="round" pointerEvents="none">
            {plan.zones.filter(zone => zone.kind === "STREET").map(zone => (
              <polygon key={zone.id} points={zone.path.map(position).join(" ")} />
            ))}
          </g>
          <g fill={STREET_COLOR} pointerEvents="none">
            {plan.zones.filter(zone => zone.kind === "STREET").map(zone => (
              <polygon key={zone.id} points={zone.path.map(position).join(" ")} />
            ))}
          </g>
          <g pointerEvents="none" stroke={STREET_MARKING} strokeWidth={1.5} strokeDasharray="9 10" strokeLinecap="round" opacity={0.8}>
            {plan.zones.filter(zone => zone.kind === "STREET").map(zone => {
              const line = streetCenterLine(zone.path.map(point => {
                const uv = geoToImage(point, image);
                return { x: uv.x * 1000, y: uv.y * 1000 };
              }));
              return line ? <line key={zone.id} x1={line[0].x} y1={line[0].y} x2={line[1].x} y2={line[1].y} vectorEffect="non-scaling-stroke" /> : null;
            })}
          </g>
          {shapes.map((shape) => {
            const coords = shape.path.map((p) => geoToImage(p, image));
            const aspect = image.heightM / image.widthM;
            const anchor = shape.zone
              ? polygonLabel(
                  coords.map((p) => ({
                    x: p.x * 1000,
                    y: p.y * 1000 * aspect,
                  })),
                )
              : undefined;
            const fitted = anchor
              ? fitPolygonText(
                  shape.label,
                  anchor.radius,
                  Math.min(23, 15000 / renderedWidth),
                  coords.map((p) => ({
                    x: p.x * 1000,
                    y: p.y * 1000 * aspect,
                  })),
                  anchor,
                )
              : undefined;
            const cx = coords.reduce(
                (n, p) => n + (p.x * 1000) / coords.length,
                0,
              ),
              cy = coords.reduce((n, p) => n + (p.y * 1000) / coords.length, 0);
            return (
              <g
                data-plan-shape
                key={shape.id}
                onPointerEnter={event => { if (shape.lot && tool === "SELECT" && event.pointerType === "mouse") setHovered({ id: shape.id, x: event.clientX, y: event.clientY }); }}
                onPointerLeave={() => { if (shape.lot) setHovered(undefined); }}
                onPointerDown={() => setHovered(undefined)}
                onClick={(event) => {
                  if (ignoreClick.current) {
                    ignoreClick.current = false;
                    event.stopPropagation();
                    return;
                  }
                  if (tool === "SELECT") {
                    event.stopPropagation();
                    onSelect(shape.id);
                  }
                }}
                style={{ cursor: tool === "SELECT" ? "pointer" : undefined }}
                pointerEvents={tool === "SELECT" ? "auto" : "none"}
              >
                <polygon
                  points={shape.path.map(position).join(" ")}
                  fill={shape.color}
                  fillOpacity={shape.contour || ("kind" in shape && shape.kind === "STREET") ? 0 : "kind" in shape && shape.kind === "PARK" ? 0.35 : shape.zone ? 0.08 : hovered?.id === shape.id ? 0.5 : 0.3}
                  stroke={shape.id === selected ? "#2563eb" : shape.lot?.status === "AVAILABLE" ? AVAILABLE_LOT_BORDER : shape.color}
                  strokeWidth={shape.id === "drawing-group-area" ? 1.5 : "kind" in shape && shape.kind === "STREET" ? (shape.id === selected ? 3 : 0) : shape.contour ? (shape.id === selected ? 5 : 4) : shape.id === selected ? 3 : !showImage ? 2.5 : 1.5}
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                />
                {shape.zone && (
                  <defs>
                    <clipPath id={`zone-label-${shape.id}`}>
                      <polygon points={shape.path.map(position).join(" ")} />
                    </clipPath>
                  </defs>
                )}
                <g
                  clipPath={
                    shape.zone ? `url(#zone-label-${shape.id})` : undefined
                  }
                >
                  {!labelsReady || ("kind" in shape && shape.kind === "BLOCK") ? null : shape.lot ? <g transform={`scale(${1000 / renderedWidth} ${1000 / (renderedWidth * aspect)})`} pointerEvents="none">
                    {lotAnnotations(shape.lot, coords.map(p => ({ x: p.x * renderedWidth, y: p.y * renderedWidth * aspect }))).map((item, index) => <text key={index} x={item.x} y={item.y} transform={`rotate(${item.angle} ${item.x} ${item.y})`} fontSize={item.size} fill={item.color} stroke="rgba(255,255,255,0.8)" strokeWidth={1.2} paintOrder="stroke" fontWeight={700} textAnchor="middle" dominantBaseline="middle">{item.text}</text>)}
                  </g> : <text
                    x={anchor ? 0 : cx}
                    y={anchor ? 0 : cy}
                    transform={
                      anchor
                        ? `translate(${anchor.x} ${anchor.y / aspect}) scale(1 ${1 / aspect}) rotate(${fitted?.angle ?? 0})`
                        : undefined
                    }
                    fontSize={fitted?.size ?? Math.min(10, 9000 / renderedWidth)}
                    fontWeight={shape.zone ? 700 : 600}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill={"kind" in shape && (shape.kind === "STREET" || shape.kind === "BLOCK") ? "#ffffff" : "#102a43"}
                    stroke={"kind" in shape && shape.kind === "BLOCK" ? "none" : "kind" in shape && shape.kind === "STREET" ? STREET_COLOR : shape.zone ? "white" : "none"}
                    strokeWidth={shape.zone ? 0.6 : 0}
                    paintOrder="stroke"
                    pointerEvents="none"
                  >
                    {fitted
                      ? fitted.lines.map((line, index) => (
                          <tspan
                            key={index}
                            x={0}
                            y={
                              (index - (fitted.lines.length - 1) / 2) *
                              fitted.size *
                              1.2
                            }
                          >
                            {line}
                          </tspan>
                        ))
                      : shape.label}
                  </text>}
                </g>
              </g>
            );
          })}
          {points.length > 0 && (
            <polyline
              points={points.map(position).join(" ")}
              fill={points.length >= 3 ? "#2563eb33" : "none"}
              stroke="#2563eb"
              strokeWidth={tool === "GROUP" ? 1.5 : 2}
              vectorEffect="non-scaling-stroke"
              pointerEvents="none"
            />
          )}
          {labelsReady && plan.zones.filter(zone => zone.kind === "BLOCK" && zone.path.length >= 3).map(zone => {
            const aspect = image.heightM / image.widthM;
            const anchor = polygonLabel(zone.path.map(point => {
              const uv = geoToImage(point, image);
              return { x: uv.x * renderedWidth, y: uv.y * renderedWidth * aspect };
            }));
            const badge = blockBadge(zone, plan.zones);
            return <g key={`badge-${zone.id}`} pointerEvents="none"
              transform={`translate(${anchor.x * 1000 / renderedWidth} ${anchor.y * 1000 / (renderedWidth * aspect)}) scale(${1000 / renderedWidth} ${1000 / (renderedWidth * aspect)})`}>
              <title>{`Manzana ${zone.name}`}</title>
              <circle r={BLOCK_BADGE_SIZE / 2} fill={badge.color} stroke="#ffffff" strokeWidth={1.5} />
              <text textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={750} fill="#ffffff">{badge.letter}</text>
            </g>;
          })}
          {plan.zones.filter(z => z.kind === "CONTOUR").map(z => <polygon key={`outline-${z.id}`} points={z.path.map(position).join(" ")} fill="none" stroke="#0ea5e9" strokeWidth={z.id === "drawing-group-area" ? 1.5 : 4} strokeLinejoin="round" vectorEffect="non-scaling-stroke" pointerEvents="none" />)}
          {previewPaths.map((path, index) => {
            const aspect = image.heightM / image.widthM;
            const anchor = polygonLabel(path.map(p => {
              const uv = geoToImage(p, image);
              return { x: uv.x * renderedWidth, y: uv.y * renderedWidth * aspect };
            }));
            const label = previewLabels[index] ?? String(index + 1);
            const fitted = fitPolygonText(label, anchor.radius, 12);
            return <g key={`preview-${index}`} pointerEvents="none">
              <polygon points={path.map(position).join(" ")} fill="#2563eb" fillOpacity={0.16} stroke="#2563eb" strokeWidth={1.5} strokeDasharray="5 3" vectorEffect="non-scaling-stroke" />
              <g transform={`translate(${anchor.x * 1000 / renderedWidth} ${anchor.y * 1000 / (renderedWidth * aspect)}) scale(${1000 / renderedWidth} ${1000 / (renderedWidth * aspect)})`}>
                <text textAnchor="middle" dominantBaseline="central" fontSize={fitted.size} fontWeight={750} fill="#1e40af" stroke="white" strokeWidth={3} paintOrder="stroke">
                  {fitted.lines.map((line, lineIndex) => <tspan key={lineIndex} x={0} dy={lineIndex === 0 ? -(fitted.lines.length - 1) * fitted.size * 0.6 : fitted.size * 1.2}>{line}</tspan>)}
                </text>
              </g>
            </g>;
          })}
          {snapMarker && (tool === "LOT" || tool === "GROUP" || tool === "STREET" || tool === "BLOCK" || selected) && <circle
            cx={geoToImage(snapMarker, image).x * 1000}
            cy={geoToImage(snapMarker, image).y * 1000}
            r={4 * 1000 / renderedWidth}
            fill="none" stroke="#06b6d4" strokeWidth={2} vectorEffect="non-scaling-stroke" pointerEvents="none"
          />}
          {rectangle.length === 4 && (
            <polygon
              points={rectangle.map(position).join(" ")}
              fill="#2563eb33"
              stroke="#2563eb"
              strokeWidth={tool === "GROUP" ? 1.5 : 2}
              vectorEffect="non-scaling-stroke"
              pointerEvents="none"
            />
          )}
          {points.map((point, index) => {
            const p = geoToImage(point, image);
            return (
              <circle
                key={index}
                cx={p.x * 1000}
                cy={p.y * 1000}
                r={2.5 * 1000 / renderedWidth}
                fill="#2563eb"
                stroke="white"
                strokeWidth={1}
                vectorEffect="non-scaling-stroke"
                pointerEvents="none"
              />
            );
          })}
          {tool === "SELECT" &&
            active?.path.map((point, index) => {
              const p = geoToImage(point, image);
              return (
                <circle
                  key={index}
                  cx={p.x * 1000}
                  cy={p.y * 1000}
                  r={3.5 * 1000 / renderedWidth}
                  fill="white"
                  stroke="#2563eb"
                  strokeWidth="2"
                  vectorEffect="non-scaling-stroke"
                  style={{ cursor: "grab", touchAction: "none" }}
                  onClick={(event) => event.stopPropagation()}
                  onPointerDown={(event) => {
                    event.stopPropagation();
                    dragging.current = index;
                    event.currentTarget.setPointerCapture(event.pointerId);
                  }}
                  onPointerMove={(event) => {
                    if (dragging.current === index)
                      onPath(
                        active.id,
                        active.path.map((p, i) =>
                          i === index ? locate(event) : p,
                        ),
                      );
                  }}
                  onPointerUp={(event) => {
                    dragging.current = null;
                    event.currentTarget.releasePointerCapture(event.pointerId);
                  }}
                  onPointerCancel={() => {
                    dragging.current = null;
                  }}
                />
              );
            })}
          {moveDrawing && <rect width={1000} height={1000} fill="transparent" style={{ cursor: "move", touchAction: "none" }}
            aria-label="Mover todo el dibujo sobre la hoja" onClick={event => event.stopPropagation()}
            onPointerDown={event => {
              if (event.button !== 0) return;
              event.stopPropagation();
              const matrix = svg.current?.getScreenCTM();
              if (!matrix) return;
              const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse());
              drawingDrag.current = { x: point.x, y: point.y };
              event.currentTarget.setPointerCapture(event.pointerId);
            }}
            onPointerMove={event => {
              if (!drawingDrag.current) return;
              event.stopPropagation();
              const matrix = svg.current?.getScreenCTM();
              if (!matrix) return;
              const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse());
              onDrawingMove?.((point.x - drawingDrag.current.x) / 1000, (point.y - drawingDrag.current.y) / 1000);
              drawingDrag.current = { x: point.x, y: point.y };
            }}
            onPointerUp={event => { event.stopPropagation(); drawingDrag.current = null; if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId); }}
            onPointerCancel={() => { drawingDrag.current = null; }} onLostPointerCapture={() => { drawingDrag.current = null; }} />}
          {canCrop && !moveDrawing && <g pointerEvents="none">
            {cropDraft && <g fill="rgba(15,23,42,.5)">
              <rect width={1000} height={cropBounds.top * 1000} />
              <rect y={cropBounds.bottom * 1000} width={1000} height={(1 - cropBounds.bottom) * 1000} />
              <rect y={cropBounds.top * 1000} width={cropBounds.left * 1000} height={(cropBounds.bottom - cropBounds.top) * 1000} />
              <rect x={cropBounds.right * 1000} y={cropBounds.top * 1000} width={(1 - cropBounds.right) * 1000} height={(cropBounds.bottom - cropBounds.top) * 1000} />
            </g>}
            <rect x={cropBounds.left * 1000} y={cropBounds.top * 1000} width={(cropBounds.right - cropBounds.left) * 1000} height={(cropBounds.bottom - cropBounds.top) * 1000} fill="none" stroke="#1974f4" strokeWidth={1.5} strokeDasharray="6 4" vectorEffect="non-scaling-stroke" />
          </g>}
        </svg>
        {canCrop && cropHandles.map(handle => <button key={`crop-${handle.label}`} type="button" className={styles.resizeHandle} aria-label={`Recortar: ${handle.label}`} title={`${handle.label}: arrastra para recortar el plano`}
          style={{ opacity: 1, cursor: handle.cursor, left: `calc(50% + ${offset.x + ((handle.x < 0 ? cropBounds.left : handle.x > 0 ? cropBounds.right : (cropBounds.left + cropBounds.right) / 2) - .5) * renderedWidth}px)`, top: `calc(50% + ${offset.y + ((handle.y < 0 ? cropBounds.top : handle.y > 0 ? cropBounds.bottom : (cropBounds.top + cropBounds.bottom) / 2) - .5) * renderedHeight}px)` }}
          onClick={event => event.stopPropagation()}
          data-crop-x={handle.x} data-crop-y={handle.y}
          onPointerDown={beginCrop} onPointerMove={dragCrop} onPointerUp={endCrop}
          onPointerCancel={cancelCrop} onLostPointerCapture={cancelCrop} onKeyDown={cropKey} />)}
        {canCrop && <p className={styles.hint}>Arrastra los bordes o las esquinas azules para recortar la hoja. Suelta para aplicar; Esc para cancelar.</p>}
        {transforming && !locked && tool === "SELECT" && (
          <div
            className={styles.selectionFrame}
            style={{
              left: `calc(50% + ${offset.x}px)`,
              top: `calc(50% + ${offset.y}px)`,
              width: renderedWidth,
              height: renderedHeight,
            }}
          />
        )}
        {!locked &&
          tool === "SELECT" &&
          !onCrop &&
          [
            {
              x: -1,
              y: -1,
              label: "Esquina superior izquierda",
              cursor: "nwse-resize",
            },
            { x: 0, y: -1, label: "Borde superior", cursor: "ns-resize" },
            {
              x: 1,
              y: -1,
              label: "Esquina superior derecha",
              cursor: "nesw-resize",
            },
            { x: 1, y: 0, label: "Borde derecho", cursor: "ew-resize" },
            {
              x: 1,
              y: 1,
              label: "Esquina inferior derecha",
              cursor: "nwse-resize",
            },
            { x: 0, y: 1, label: "Borde inferior", cursor: "ns-resize" },
            {
              x: -1,
              y: 1,
              label: "Esquina inferior izquierda",
              cursor: "nesw-resize",
            },
            { x: -1, y: 0, label: "Borde izquierdo", cursor: "ew-resize" },
          ].map((handle) => (
            <button
              key={handle.label}
              type="button"
              className={styles.resizeHandle}
              aria-label={`Cambiar tamaño: ${handle.label}`}
              title={`${handle.label}: arrastra para cambiar el tamaño`}
              style={{
                cursor: handle.cursor,
                left: `calc(50% + ${offset.x + (handle.x * renderedWidth) / 2}px)`,
                top: `calc(50% + ${offset.y + (handle.y * renderedHeight) / 2}px)`,
              }}
              onClick={(event) => event.stopPropagation()}
              data-handle-x={handle.x}
              data-handle-y={handle.y}
              onPointerDown={beginResize}
              onPointerMove={dragResize}
              onPointerUp={endResize}
              onPointerCancel={cancelResize}
              onKeyDown={(event) => {
                if (
                  ["ArrowUp", "ArrowRight", "ArrowDown", "ArrowLeft"].includes(
                    event.key,
                  )
                ) {
                  event.preventDefault();
                  setZoom((value) =>
                    Math.max(
                      0.25,
                      Math.min(
                        12,
                        value +
                          (["ArrowUp", "ArrowRight"].includes(event.key)
                            ? 0.1
                            : -0.1),
                      ),
                    ),
                  );
                }
              }}
            />
          ))}
      </div>
    </div>
  );
}
