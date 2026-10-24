"use client";

import { useEffect, useRef, useState, type PointerEvent, type MouseEvent } from "react";
import { APARTMENT_STATUS_COLORS, type FloorPoint, type PlanFloor } from "@/shared/lib/apartment-plan";
import s from "./apartment-plan.module.css";

export function ApartmentFloorCanvas({ floor, selected, drawing = false, compact = false, showImage = true, points = [], previewPaths = [], previewLabels = [], onPoint, onDraw, onSelect, onPath }: {
  floor: PlanFloor;
  selected?: string;
  drawing?: boolean;
  compact?: boolean;
  showImage?: boolean;
  previewPaths?: FloorPoint[][];
  previewLabels?: string[];
  points?: FloorPoint[];
  onPoint?: (point: FloorPoint) => void;
  onDraw?: (path: FloorPoint[]) => void;
  onSelect: (id: string) => void;
  onPath?: (path: FloorPoint[]) => void;
}) {
  const svg = useRef<SVGSVGElement>(null);
  const start = useRef<{ point: FloorPoint; x: number; y: number } | null>(null);
  const ignoreClick = useRef(false);
  const [rectangle, setRectangle] = useState<FloorPoint[]>([]);
  const width = floor.image?.width ?? 1000, height = floor.image?.height ?? 700;
  const [renderScale, setRenderScale] = useState(1);
  useEffect(() => {
    const node = svg.current;
    if (!node) return;
    const observer = new ResizeObserver(() => {
      const bounds = node.getBoundingClientRect();
      setRenderScale(Math.max(.001, Math.min(bounds.width / width, bounds.height / height)));
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [width, height]);
  const locate = (event: PointerEvent<SVGElement> | MouseEvent<SVGElement>): FloorPoint => {
    const node = svg.current!;
    const matrix = node.getScreenCTM();
    if (!matrix) return { x: 0, y: 0 };
    const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse());
    return { x: Math.max(0, Math.min(1, point.x / width)), y: Math.max(0, Math.min(1, point.y / height)) };
  };
  const coordinates = (path: FloorPoint[]) => path.map(p => `${p.x * width},${p.y * height}`).join(" ");
  const rect = (a: FloorPoint, b: FloorPoint) => [a, { x: b.x, y: a.y }, b, { x: a.x, y: b.y }];
  const unit = floor.apartments.find(a => a.id === selected);
  return <div className={s.canvas}>
    <svg ref={svg} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet" aria-label={`Plano de ${floor.name}`} style={{ cursor: drawing ? "crosshair" : "default", ...(compact ? { height: "auto", minHeight: 220, maxHeight: 440, aspectRatio: `${width} / ${height}` } : {}) }}
      onPointerDown={event => {
        if (!drawing || event.button !== 0) return;
        start.current = { point: locate(event), x: event.clientX, y: event.clientY };
        event.currentTarget.setPointerCapture(event.pointerId);
      }}
      onPointerMove={event => {
        if (!start.current || Math.hypot(event.clientX - start.current.x, event.clientY - start.current.y) < 5) return;
        setRectangle(rect(start.current.point, locate(event)));
      }}
      onPointerUp={event => {
        const previous = start.current;
        start.current = null;
        setRectangle([]);
        if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
        if (!previous || Math.hypot(event.clientX - previous.x, event.clientY - previous.y) < 5) return;
        ignoreClick.current = true;
        onDraw?.(rect(previous.point, locate(event)));
      }}
      onPointerCancel={() => { start.current = null; setRectangle([]); }}
      onClick={event => {
        if (ignoreClick.current) { ignoreClick.current = false; return; }
        if (drawing) onPoint?.(locate(event));
      }}>
      <rect width={width} height={height} fill="white" />
      {floor.image && <svg width={width} height={height} viewBox={floor.image.crop ? `${floor.image.crop.left * width} ${floor.image.crop.top * height} ${(floor.image.crop.right - floor.image.crop.left) * width} ${(floor.image.crop.bottom - floor.image.crop.top) * height}` : `0 0 ${width} ${height}`} preserveAspectRatio="none" opacity={showImage ? 1 : 0} pointerEvents="none"><image href={floor.image.url} width={width} height={height} preserveAspectRatio="none" /></svg>}
      {floor.apartments.map(apartment => {
        const center = apartment.path.reduce((sum, p) => ({ x: sum.x + p.x / apartment.path.length, y: sum.y + p.y / apartment.path.length }), { x: 0, y: 0 });
        return <g key={apartment.id} role="button" tabIndex={drawing ? -1 : 0} aria-label={`Departamento ${apartment.code}`} style={{ cursor: drawing ? "crosshair" : "pointer" }}
          onClick={event => { if (!drawing) { event.stopPropagation(); onSelect(apartment.id); } }}
          onKeyDown={event => { if (!drawing && (event.key === "Enter" || event.key === " ")) { event.preventDefault(); onSelect(apartment.id); } }}>
          <polygon points={coordinates(apartment.path)} fill={APARTMENT_STATUS_COLORS[apartment.status]} fillOpacity={selected === apartment.id ? .45 : .22} stroke={selected === apartment.id ? "#1d4ed8" : APARTMENT_STATUS_COLORS[apartment.status]} strokeWidth={selected === apartment.id ? 2.5 : 1.5} vectorEffect="non-scaling-stroke" />
          <text x={center.x * width} y={center.y * height} textAnchor="middle" dominantBaseline="middle" fontSize={12 / renderScale} fontWeight={800} fill="#123a68" stroke="white" strokeWidth={2 / renderScale} paintOrder="stroke" pointerEvents="none">{apartment.code}</text>
        </g>;
      })}
      {points.length > 0 && <polyline points={coordinates(points)} fill="#2563eb22" stroke="#2563eb" strokeWidth={1.5} vectorEffect="non-scaling-stroke" pointerEvents="none" />}
      {previewPaths.map((path, index) => {
        const center = path.reduce((sum, p) => ({ x: sum.x + p.x / path.length, y: sum.y + p.y / path.length }), { x: 0, y: 0 });
        return <g key={`group-${index}`} pointerEvents="none"><polygon points={coordinates(path)} fill="#2563eb" fillOpacity={.18} stroke="#2563eb" strokeWidth={1.5} vectorEffect="non-scaling-stroke" /><text x={center.x * width} y={center.y * height} fontSize={12 / renderScale} textAnchor="middle" dominantBaseline="middle" fontWeight={800} fill="#123a68">{previewLabels[index] ?? index + 1}</text></g>;
      })}
      {rectangle.length > 0 && <polygon points={coordinates(rectangle)} fill="#2563eb22" stroke="#2563eb" strokeWidth={1.5} vectorEffect="non-scaling-stroke" pointerEvents="none" />}
      {!drawing && onPath && unit?.path.map((point, index) => <circle key={index} cx={point.x * width} cy={point.y * height} r={Math.min(width, height) * .008} fill="white" stroke="#2563eb" strokeWidth={1.5} vectorEffect="non-scaling-stroke" style={{ cursor: "grab" }}
        onClick={event => event.stopPropagation()}
        onPointerDown={event => { event.stopPropagation(); event.currentTarget.setPointerCapture(event.pointerId); }}
        onPointerMove={event => {
          if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
          event.stopPropagation();
          onPath(unit.path.map((p, i) => i === index ? locate(event) : p));
        }}
        onPointerUp={event => { event.stopPropagation(); if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId); }} />)}
    </svg>
  </div>;
}
