"use client";

import { useEffect, useRef, useState } from "react";
import { geoToImage, imageToGeo } from "@/shared/lib/plan-coordinates";
import { LOT_COLORS, type Point, type SitePlan } from "@/shared/lib/site-plan";
import type { PlanTool } from "./site-plan-map";
import {
  LockKeyhole,
  UnlockKeyhole,
  Plus,
  Minus,
  RotateCcw,
} from "lucide-react";
import styles from "./site-plan-canvas.module.css";
import { lotAnnotations } from "@/shared/lib/lot-annotations";
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
  previewPaths = [],
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
  previewPaths?: Point[][];
}) {
  const svg = useRef<SVGSVGElement>(null);
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
      color: z.kind === "CONTOUR" ? "#0ea5e9" : z.kind === "BLOCK" ? "#3b82f6" : "#a855f7",
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
    ...plan.zones.filter(z => z.id !== selected && z.kind === "BLOCK").map(z => z.path),
  ];
  const snap = (point: Point, disabled = false) => {
    if (disabled || (tool !== "LOT" && tool !== "GROUP" && !(tool === "SELECT" && active && !active.zone))) return { point, snapped: false };
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
                  fillOpacity={shape.contour ? 0 : shape.zone ? 0.08 : 0.3}
                  stroke={shape.id === selected ? "#2563eb" : shape.color}
                  strokeWidth={shape.contour ? (shape.id === selected ? 5 : 4) : shape.id === selected ? 3 : !showImage ? 2.5 : 1.5}
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
                  {shape.lot ? <g transform={`scale(${1000 / renderedWidth} ${1000 / (renderedWidth * aspect)})`} pointerEvents="none">
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
                    fill="#102a43"
                    stroke={shape.zone ? "white" : "none"}
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
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
              pointerEvents="none"
            />
          )}
          {plan.zones.filter(z => z.kind === "CONTOUR").map(z => <polygon key={`outline-${z.id}`} points={z.path.map(position).join(" ")} fill="none" stroke="#0ea5e9" strokeWidth={4} strokeLinejoin="round" vectorEffect="non-scaling-stroke" pointerEvents="none" />)}
          {previewPaths.map((path, index) => <polygon key={`preview-${index}`} points={path.map(position).join(" ")} fill="#2563eb" fillOpacity={0.12} stroke="#2563eb" strokeWidth={2} strokeDasharray="5 3" vectorEffect="non-scaling-stroke" pointerEvents="none" />)}
          {snapMarker && (tool === "LOT" || tool === "GROUP" || selected) && <circle
            cx={geoToImage(snapMarker, image).x * 1000}
            cy={geoToImage(snapMarker, image).y * 1000}
            r={7 * 1000 / renderedWidth}
            fill="none" stroke="#06b6d4" strokeWidth={2} vectorEffect="non-scaling-stroke" pointerEvents="none"
          />}
          {rectangle.length === 4 && (
            <polygon
              points={rectangle.map(position).join(" ")}
              fill="#2563eb33"
              stroke="#2563eb"
              strokeWidth="2"
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
                r="4"
                fill="#2563eb"
                stroke="white"
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
                  r="6"
                  fill="white"
                  stroke="#2563eb"
                  strokeWidth="2"
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
        </svg>
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
