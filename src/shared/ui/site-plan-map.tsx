"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { env } from "@/shared/lib/env";
import { formatPrice } from "@/shared/lib/format";
import { lotAnnotations } from "@/shared/lib/lot-annotations";
import { snapPlanPoint } from "@/shared/lib/snap-plan-point";
import { polygonLabel, fitPolygonText } from "@/shared/lib/polygon-label";
import styles from './site-plan-map.module.css';
import {
  loadGoogleMaps,
  type GoogleMap,
  type MapsSdk,
  type MapOverlay,
} from "../lib/google-maps";
import {
  LOT_COLORS,
  type Point,
  type SitePlan,
  type PlanImage,
} from "../lib/site-plan";

export type PlanTool = "SELECT" | "BLOCK" | "STREET" | "PARK" | "LOT" | "GROUP" | "CONTOUR";
export type PlanMapMarker = Point & {
  id: string;
  title: string;
  priceLabel: string;
  priceAmount?: number;
  priceCurrency?: string;
  iconUrl?: string;
};
type Props = {
  plan: SitePlan;
  center: Point;
  showImage: boolean;
  selected?: string;
  tool?: PlanTool;
  points?: Point[];
  onPoint?: (point: Point) => void;
  onSelect?: (id: string) => void;
  onPath?: (id: string, path: Point[]) => void;
  moveAll?: boolean;
  placementMode?: boolean;
  onMapCenter?: (point: Point) => void;
  mapCenterRequest?: number;
  focusPlanRequest?: number;
  planContextRadiusM?: number;
  publicView?: boolean;
  focusProject?: boolean;
  overviewBounds?: readonly Point[];
  mapType?: 'roadmap' | 'satellite';
  minimalControls?: boolean;
  compactMapControl?: boolean;
  hideLegendOnMobile?: boolean;
  legendAction?: ReactNode;
  legendStatuses?: readonly (keyof typeof LOT_COLORS)[];
  className?: string;
  markers?: readonly PlanMapMarker[];
  clusterMarkers?: boolean;
  markerFocusId?: string | null;
  hideFocusedMarker?: boolean;
  images?: PlanImage[];
  onMarkerSelect?: (id: string) => void;
  onViewport?: (view: { center: Point; zoom: number }) => void;
};

function imageOverlay(
  sdk: MapsSdk,
  map: GoogleMap,
  image: PlanImage,
): MapOverlay {
  const overlay = new sdk.OverlayView();
  let node: HTMLElement | undefined;
  let canvas: HTMLCanvasElement | undefined;
  let source: HTMLImageElement | undefined;
  let mounted = false;
  const size = 1000;
  const styleNode = (element: HTMLElement) => {
    Object.assign(element.style, {
      position: "absolute",
      width: `${size}px`,
      height: `${size}px`,
      maxWidth: "none",
      transformOrigin: "0 0",
      pointerEvents: "none",
      opacity: String(image.opacity),
      zIndex: "0",
    });
  };
  overlay.onAdd = () => {
    mounted = true;
    canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    node = canvas;
    styleNode(canvas);
    overlay.getPanes()?.overlayLayer.append(canvas);
    source = new Image();
    source.crossOrigin = "anonymous";
    let corsFallback = false;
    source.onload = () => {
      if (!mounted || !canvas) return;
      const loadedImage = source;
      const context = canvas.getContext("2d", { willReadFrequently: true });
      if (!context) {
        console.error("No se pudo preparar la transparencia del plano.");
        return;
      }
      if (!loadedImage) return;
      context.drawImage(loadedImage, 0, 0, size, size);
      try {
        const pixels = context.getImageData(0, 0, size, size);
        for (let i = 0; i < pixels.data.length; i += 4) {
          const lightestShadow = Math.min(pixels.data[i], pixels.data[i + 1], pixels.data[i + 2]);
          const opacity = Math.max(0, Math.min(1, (245 - lightestShadow) / 45));
          pixels.data[i + 3] *= opacity;
        }
        context.putImageData(pixels, 0, 0);
      } catch (cause) {
        console.error("No se pudo quitar el fondo blanco del plano.", cause);
        const fallback = loadedImage;
        fallback.alt = "Plano del proyecto";
        styleNode(fallback);
        canvas.replaceWith(fallback);
        node = fallback;
        canvas = undefined;
      }
    };
    source.onerror = () => {
      if (!mounted || !source) return;
      if (!corsFallback) {
        corsFallback = true;
        source.crossOrigin = null;
        source.src = image.url;
        return;
      }
      console.error("No se pudo cargar la imagen del plano.");
    };
    source.src = image.url;
  };
  overlay.draw = () => {
    if (!node) return;
    const angle = (image.rotation * Math.PI) / 180;
    const corner = (x: number, y: number) => {
      const east = x * Math.cos(angle) + y * Math.sin(angle);
      const north = -x * Math.sin(angle) + y * Math.cos(angle);
      return overlay
        .getProjection()
        .fromLatLngToDivPixel(
          new sdk.LatLng(
            image.center.lat + north / 111320,
            image.center.lng +
              east / (111320 * Math.cos((image.center.lat * Math.PI) / 180)),
          ),
        );
    };
    const a = corner(-image.widthM / 2, image.heightM / 2),
      b = corner(image.widthM / 2, image.heightM / 2),
      c = corner(-image.widthM / 2, -image.heightM / 2);
    if (a && b && c)
      node.style.transform = `matrix(${(b.x - a.x) / 1000},${(b.y - a.y) / 1000},${(c.x - a.x) / 1000},${(c.y - a.y) / 1000},${a.x},${a.y})`;
  };
  overlay.onRemove = () => {
    mounted = false;
    source?.removeAttribute("src");
    source = undefined;
    node?.remove();
    node = undefined;
    canvas = undefined;
  };
  overlay.setMap(map);
  return overlay;
}

function fitMarkers(
  map: GoogleMap,
  sdk: MapsSdk,
  markers: readonly Point[],
  maxZoom = 16,
) {
  if (!markers.length) return;
  const bounds = new sdk.LatLngBounds();
  markers.forEach((marker) => bounds.extend(marker));
  map.fitBounds(bounds);
  const zoom = map.getZoom();
  if (zoom != null && zoom > maxZoom) map.setZoom(maxZoom);
}

const CLUSTER_PX = 44;
const PRICE_CLUSTER_PX = 96;
const PRICE_MAX_ZOOM = 16;
const MAX_CLUSTER_ZOOM = 18;
type MarkerGroup = { center: Point; markers: PlanMapMarker[] };

function mercatorPixel(point: Point, zoom: number) {
  const scale = 256 * Math.pow(2, zoom);
  const sin = Math.sin((point.lat * Math.PI) / 180);
  return {
    x: ((point.lng + 180) / 360) * scale,
    y: (0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)) * scale,
  };
}

function pixelDistance(a: Point, b: Point, zoom: number) {
  const pa = mercatorPixel(a, zoom);
  const pb = mercatorPixel(b, zoom);
  return Math.hypot(pa.x - pb.x, pa.y - pb.y);
}

function polygonCenter(path: Point[]): Point | undefined {
  if (path.length < 3) return undefined;
  const latitude = path.reduce((sum, point) => sum + point.lat, 0) / path.length;
  const points = path.map(point => ({
    x: (point.lng - path[0].lng) * 111320 * Math.cos((latitude * Math.PI) / 180),
    y: (point.lat - path[0].lat) * 111320,
  }));
  const bounds = points.reduce((result, point) => ({
    minX: Math.min(result.minX, point.x),
    maxX: Math.max(result.maxX, point.x),
    minY: Math.min(result.minY, point.y),
    maxY: Math.max(result.maxY, point.y),
  }), { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity });
  const contains = (x: number, y: number) => {
    let inside = false;
    for (let i = 0, j = points.length - 1; i < points.length; j = i, i += 1) {
      const a = points[i];
      const b = points[j];
      if ((a.y > y) !== (b.y > y) && x < ((b.x - a.x) * (y - a.y)) / (b.y - a.y) + a.x) {
        inside = !inside;
      }
    }
    return inside;
  };
  const clearance = (x: number, y: number) => {
    let minDistance = Infinity;
    for (let i = 0; i < points.length; i += 1) {
      const a = points[i];
      const b = points[(i + 1) % points.length];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const lengthSquared = dx * dx + dy * dy;
      const t = lengthSquared ? Math.max(0, Math.min(1, ((x - a.x) * dx + (y - a.y) * dy) / lengthSquared)) : 0;
      minDistance = Math.min(minDistance, Math.hypot(x - a.x - t * dx, y - a.y - t * dy));
    }
    return contains(x, y) ? minDistance : -minDistance;
  };
  let best = { x: 0, y: 0, distance: -Infinity };
  const width = bounds.maxX - bounds.minX;
  const height = bounds.maxY - bounds.minY;
  let step = Math.min(width, height) / 8;
  if (!Number.isFinite(step) || step <= 0) return undefined;
  for (let y = bounds.minY + step / 2; y < bounds.maxY; y += step) {
    for (let x = bounds.minX + step / 2; x < bounds.maxX; x += step) {
      const distance = clearance(x, y);
      if (distance > best.distance) best = { x, y, distance };
    }
  }
  while (step > 0.1) {
    let improved = false;
    for (const dx of [-step, 0, step]) {
      for (const dy of [-step, 0, step]) {
        const x = best.x + dx;
        const y = best.y + dy;
        const distance = clearance(x, y);
        if (distance > best.distance) {
          best = { x, y, distance };
          improved = true;
        }
      }
    }
    if (!improved) step /= 2;
  }
  if (best.distance <= 0) return undefined;
  const markerCandidates = points
    .map(point => ({
      x: best.x + (point.x - best.x) * 0.48,
      y: best.y + (point.y - best.y) * 0.48,
    }))
    .map(point => ({ ...point, distance: clearance(point.x, point.y) }))
    .filter(point => point.distance >= Math.max(2, best.distance * 0.2))
    .sort((a, b) => Math.hypot(b.x - best.x, b.y - best.y) - Math.hypot(a.x - best.x, a.y - best.y));
  const markerPoint = markerCandidates[0] ?? best;
  return {
    lat: path[0].lat + markerPoint.y / 111320,
    lng: path[0].lng + markerPoint.x / (111320 * Math.cos((latitude * Math.PI) / 180)),
  };
}

function selectedLotElevation(sdk: MapsSdk, path: Point[]): MapOverlay {
  const overlay = new sdk.OverlayView();
  const node = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  node.classList.add(styles.selectedLotElevation);
  node.setAttribute("aria-hidden", "true");

  overlay.onAdd = () => {
    overlay.getPanes()?.overlayLayer.append(node);
  };
  overlay.draw = () => {
    const projection = overlay.getProjection();
    const pixels = path.map(point =>
      projection.fromLatLngToDivPixel(new sdk.LatLng(point.lat, point.lng)),
    );
    if (pixels.some(point => !point)) return;
    const points = pixels as { x: number; y: number }[];
    const padding = 20;
    const minX = Math.min(...points.map(point => point.x)) - padding;
    const minY = Math.min(...points.map(point => point.y)) - padding;
    const width = Math.max(...points.map(point => point.x)) - minX + padding;
    const height = Math.max(...points.map(point => point.y)) - minY + padding;
    const pathPoints = points.map(point => `${point.x - minX},${point.y - minY}`);
    const shadowPoints = points.map(point => `${point.x - minX},${point.y - minY + 10}`);

    node.setAttribute("width", String(width));
    node.setAttribute("height", String(height));
    node.setAttribute("viewBox", `0 0 ${width} ${height}`);
    Object.assign(node.style, { left: `${minX}px`, top: `${minY}px` });
    node.replaceChildren();

    const shadow = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    shadow.setAttribute("points", shadowPoints.join(" "));
    shadow.setAttribute("class", styles.selectedLotShadow);
    node.append(shadow);

    const top = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    top.setAttribute("points", pathPoints.join(" "));
    top.setAttribute("class", styles.selectedLotTop);
    node.append(top);
  };
  overlay.onRemove = () => node.remove();
  return overlay;
}

/**
 * Agrupa marcadores que caen a menos de `threshold` píxeles entre sí en el zoom
 * actual. Se usa una agrupación voraz contra el centroide de cada grupo para que
 * los proyectos de una misma zona queden en una sola burbuja sin cadenas largas.
 */
function groupMarkers(
  markers: readonly PlanMapMarker[],
  zoom: number,
  threshold = CLUSTER_PX,
): MarkerGroup[] {
  const groups: MarkerGroup[] = [];
  for (const marker of markers) {
    const group = groups.find(
      (item) => pixelDistance(item.center, marker, zoom) < threshold,
    );
    if (!group) {
      groups.push({ center: { lat: marker.lat, lng: marker.lng }, markers: [marker] });
      continue;
    }
    group.markers.push(marker);
    group.center = {
      lat: group.markers.reduce((sum, item) => sum + item.lat, 0) / group.markers.length,
      lng: group.markers.reduce((sum, item) => sum + item.lng, 0) / group.markers.length,
    };
  }
  return groups;
}

/** Primer zoom en el que todos los pines del grupo se separan; tope en 19. */
function zoomToSeparate(markers: readonly PlanMapMarker[], fromZoom: number) {
  for (let zoom = Math.max(fromZoom + 1, 1); zoom <= 19; zoom += 1) {
    let separated = true;
    for (let i = 0; i < markers.length && separated; i += 1) {
      for (let j = i + 1; j < markers.length; j += 1) {
        if (pixelDistance(markers[i], markers[j], zoom) < CLUSTER_PX) {
          separated = false;
          break;
        }
      }
    }
    if (separated) return zoom;
  }
  return 19;
}

export function SitePlanMap(props: Props) {
  const host = useRef<HTMLDivElement>(null);
  const map = useRef<GoogleMap | null>(null);
  const [sdk, setSdk] = useState<MapsSdk>();
  const [error, setError] = useState("");
  const [zoom, setZoom] = useState(18);
  const callbacks = useRef(props);
  useEffect(() => {
    callbacks.current = props;
  });
  useEffect(() => {
    let alive = true;
    const listeners: { remove(): void }[] = [];
    const authError = () => {
      console.error(
        "Google Maps rechazó la clave. Revisa los dominios autorizados y Maps JavaScript API.",
      );
      setError("No se pudieron cargar los datos...");
    };
    window.addEventListener("ariz-maps-auth-error", authError);
    loadGoogleMaps(env.googleMapsApiKey)
      .then((maps) => {
        if (!alive || !host.current) return;
        const current = new maps.Map(host.current, {
          center: callbacks.current.center,
          zoom: callbacks.current.overviewBounds?.length ? 5 : 18,
          mapTypeId: callbacks.current.mapType ?? "satellite",
          tilt: 0,
          streetViewControl: false,
          mapTypeControl: !callbacks.current.minimalControls && !callbacks.current.compactMapControl,
          fullscreenControl: true,
          disableDoubleClickZoom: true,
          draggableCursor: "crosshair",
        });
        map.current = current;
        setSdk(maps);
        const initial = callbacks.current.plan;
        const allPoints = [
          ...initial.lots.flatMap((lot) => lot.path),
          ...initial.zones.flatMap((zone) => zone.path),
          ...(callbacks.current.markers ?? []),
        ];
        if (!allPoints.length && initial.image) {
          const image = initial.image;
          const extent = Math.hypot(image.widthM, image.heightM) / 2;
          const latDelta = extent / 111320,
            lngDelta =
              extent / (111320 * Math.cos((image.center.lat * Math.PI) / 180));
          allPoints.push(
            {
              lat: image.center.lat - latDelta,
              lng: image.center.lng - lngDelta,
            },
            {
              lat: image.center.lat + latDelta,
              lng: image.center.lng + lngDelta,
            },
          );
        }
        const initialMarkers = callbacks.current.markers ?? [];
        if (initialMarkers.length && !callbacks.current.overviewBounds?.length) {
          fitMarkers(current, maps, initialMarkers);
        } else if (callbacks.current.overviewBounds?.length) {
          const bounds = new maps.LatLngBounds();
          callbacks.current.overviewBounds.forEach(point => bounds.extend(point));
          current.fitBounds(bounds);
        }
        else if (allPoints.length && !callbacks.current.focusProject) {
          const bounds = new maps.LatLngBounds();
          allPoints.forEach((point) => bounds.extend(point));
          current.fitBounds(bounds);
        }
        listeners.push(
          current.addListener("click", (event) => {
            if (event.latLng) {
              const point = {
                lat: event.latLng.lat(),
                lng: event.latLng.lng(),
              };
              const state = callbacks.current;
              const paths = [
                ...state.plan.zones.filter(zone => zone.id !== state.selected && (zone.kind === "BLOCK" || zone.kind === "STREET")).map(zone => zone.path),
                ...state.plan.lots.filter(lot => lot.id !== state.selected).map(lot => lot.path),
              ];
              state.onPoint?.(state.tool === "STREET" || state.tool === "BLOCK"
                ? snapPlanPoint(point, paths, p => mercatorPixel(p, current.getZoom() ?? 18)).point
                : point);
            }
          }),
        );
        listeners.push(
          current.addListener("idle", () => {
            const c = current.getCenter();
            if (c) {
              const center = { lat: c.lat(), lng: c.lng() };
              callbacks.current.onMapCenter?.(center);
              callbacks.current.onViewport?.({
                center,
                zoom: current.getZoom() ?? 18,
              });
            }
          }),
        );
        listeners.push(
          current.addListener("zoom_changed", () =>
            setZoom(current.getZoom() ?? 18),
          ),
        );
      })
      .catch((cause) => {
        if (alive)
          setError(
            cause instanceof Error
              ? cause.message
              : "No se pudieron cargar los datos...",
          );
      });
    return () => {
      alive = false;
      listeners.forEach((listener) => listener.remove());
      window.removeEventListener("ariz-maps-auth-error", authError);
      map.current = null;
    };
  }, []);

  useEffect(() => {
    const current = map.current;
    if (!sdk || !current) return;
    const objects: { setMap(map: GoogleMap | null): void }[] = [];
    const listeners: { remove(): void }[] = [];
    const editing = props.tool === "SELECT" && !props.placementMode;
    const shapes = [
      ...props.plan.zones.map((zone) => ({
        id: zone.id,
        path: zone.path,
        color: zone.kind === "CONTOUR" ? (props.publicView ? "#18754b" : "#0ea5e9") : zone.kind === "PARK" ? "#4d7c0f" : zone.kind === "BLOCK" ? "#3b82f6" : "#92400e",
        lot: undefined,
        label: zone.kind === "CONTOUR" ? "" : zone.name,
        contour: zone.kind === "CONTOUR",
        street: zone.kind === "STREET",
        park: zone.kind === "PARK",
        zone: true,
      })),
      ...props.plan.lots
        .filter((lot) => lot.path.length >= 3)
        .map((lot) => ({
          id: lot.id,
          path: lot.path,
          color: LOT_COLORS[lot.status],
          lot,
          label: lot.code,
          zone: false,
          contour: false,
          street: false,
          park: false,
        })),
    ];
    for (const shape of shapes) {
      const active = shape.id === props.selected;
      const fillOpacity = shape.contour ? 0 : shape.park ? (props.publicView ? 0.25 : 0.35) : shape.street ? (props.publicView ? 0.15 : 0.3) : shape.zone ? (props.publicView ? 0.025 : 0.08) : active ? 0.32 : props.publicView ? 0.13 : 0.36;
      const strokeWeight = props.publicView ? (shape.contour ? 1.5 : active ? 2.5 : 1.6) : shape.contour ? (active ? 5 : 4) : active ? 3 : !props.showImage ? 2.5 : 1.5;
      const polygon = new sdk.Polygon({
        map: current,
        paths: shape.path,
        fillColor: shape.color,
        fillOpacity,
        strokeColor: active && !props.publicView ? "#ffffff" : shape.color,
        strokeWeight,
        editable: editing && active && !props.moveAll,
        draggable: editing && (!!props.moveAll || (active && !shape.contour)),
        clickable: !props.placementMode && (!props.tool || editing),
        zIndex: shape.contour ? 2 : shape.zone ? 1 : active ? 4 : 3,
      });
      objects.push(polygon);
      if (props.publicView && active && !shape.zone) {
        objects.push(new sdk.Polyline({
          map: current,
          path: [...shape.path, shape.path[0]],
          strokeColor: "#ffffff",
          strokeOpacity: 0.95,
          strokeWeight: 6,
          zIndex: 30,
          clickable: false,
        }));
        objects.push(new sdk.Polyline({
          map: current,
          path: [...shape.path, shape.path[0]],
          strokeColor: "#075985",
          strokeOpacity: 1,
          strokeWeight: 2.5,
          zIndex: 31,
          clickable: false,
        }));
        const elevation = selectedLotElevation(sdk, shape.path);
        elevation.setMap(current);
        objects.push(elevation);
      }
      if (shape.contour && shape.path.length >= 3) {
        objects.push(new sdk.Polyline({
          map: current,
          path: [...shape.path, shape.path[0]],
          strokeColor: shape.color,
          strokeOpacity: 1,
          strokeWeight: props.publicView ? 1.5 : 4,
          zIndex: 30,
          clickable: false,
        }));
      }
      listeners.push(
        polygon.addListener("click", () =>
          callbacks.current.onSelect?.(shape.id),
        ),
      );
      if (props.publicView && shape.lot) {
        listeners.push(polygon.addListener("mouseover", () => {
          polygon.setOptions({
            fillOpacity: Math.min(0.48, fillOpacity + 0.16),
            strokeWeight: strokeWeight + 1.2,
            zIndex: 40,
          });
        }));
        listeners.push(polygon.addListener("mouseout", () => {
          polygon.setOptions({ fillOpacity, strokeWeight, zIndex: active ? 4 : 3 });
        }));
      }
      const persist = () =>
        callbacks.current.onPath?.(
          shape.id,
          polygon
            .getPath()
            .getArray()
            .map((p) => ({ lat: p.lat(), lng: p.lng() })),
        );
      if (editing && (active || props.moveAll)) {
        if (!props.moveAll) listeners.push(polygon.addListener("mouseup", persist));
        listeners.push(polygon.addListener("dragend", persist));
      }
      if (shape.label && (!shape.zone || zoom >= 19)) {
        const label = new sdk.OverlayView();
        const node = document.createElement("div");
        node.textContent = shape.label;
        Object.assign(node.style, {
          position: "absolute",
          pointerEvents: "none",
          whiteSpace: "nowrap",
          font: "600 9px sans-serif",
          color: "#0f172a",
          background: "transparent",
          borderRadius: "4px",
          padding: "0",
          transform: "translate(-50%,-50%)",
          zIndex: "20",
        });
        label.onAdd = () => {
          label.getPanes()?.overlayLayer.append(node);
        };
        label.draw = () => {
          if (shape.lot) {
            const projection = label.getProjection();
            const pixels = shape.path.map(point => projection.fromLatLngToDivPixel(new sdk.LatLng(point.lat, point.lng)));
            if (pixels.some(point => !point)) return;
            const xy = pixels as { x: number; y: number }[];
            const minX = Math.min(...xy.map(p => p.x)) - 20, minY = Math.min(...xy.map(p => p.y)) - 20;
            const width = Math.max(...xy.map(p => p.x)) - minX + 20, height = Math.max(...xy.map(p => p.y)) - minY + 20;
            node.replaceChildren();
            Object.assign(node.style, { left: `${minX}px`, top: `${minY}px`, transform: 'none', width: `${width}px`, height: `${height}px` });
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttribute('width', String(width)); svg.setAttribute('height', String(height));
            const annotations = lotAnnotations(shape.lot, xy.map(p => ({ x: p.x - minX, y: p.y - minY })));
            // Overview: number and area only. Dimensions appear when inspecting a lot.
            const visibleAnnotations = props.publicView && (!active || zoom < 20) ? annotations.slice(0, 2) : annotations;
            for (const item of visibleAnnotations) {
              const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
              text.textContent = item.text;
              for (const [key, value] of Object.entries({ x: item.x, y: item.y, transform: `rotate(${item.angle} ${item.x} ${item.y})`, 'font-size': props.publicView ? Math.min(item.size, 14) : item.size, fill: item.color, 'text-anchor': 'middle', 'dominant-baseline': 'middle', 'font-weight': '600', stroke: 'rgba(255,255,255,0.8)', 'stroke-width': props.publicView ? '0.8' : '1.2', 'paint-order': 'stroke' })) text.setAttribute(key, String(value));
              svg.append(text);
            }
            node.append(svg);
            return;
          }

          if (shape.zone) {
            const projection = label.getProjection();
            const pixels = shape.path
              .map((point) =>
                projection.fromLatLngToDivPixel(
                  new sdk.LatLng(point.lat, point.lng),
                ),
              )
              .filter((point): point is { x: number; y: number } =>
                Boolean(point),
              );
            const anchor = polygonLabel(pixels);
            node.style.left = `${anchor.x}px`;
            node.style.top = `${anchor.y}px`;
            const fitted = fitPolygonText(
              shape.label,
              anchor.radius,
              15,
              pixels,
              anchor,
            );
            node.style.transform = `translate(-50%,-50%) rotate(${fitted.angle}deg)`;
            node.textContent = fitted.lines.join("\n");
            node.style.fontSize = `${fitted.size}px`;
            node.style.fontWeight = "700";
            node.style.whiteSpace = "pre";
            node.style.textAlign = "center";
            node.style.lineHeight = "1.2";
            node.style.padding = "0";
            node.style.background = "transparent";
            node.style.textShadow = "0 1px 2px white, 1px 0 2px white";
            return;
          }
          const c = shape.path.reduce(
            (a, p) => ({
              lat: a.lat + p.lat / shape.path.length,
              lng: a.lng + p.lng / shape.path.length,
            }),
            { lat: 0, lng: 0 },
          );
          const pixel = label
            .getProjection()
            .fromLatLngToDivPixel(new sdk.LatLng(c.lat, c.lng));
          if (pixel) {
            node.style.left = `${pixel.x}px`;
            node.style.top = `${pixel.y}px`;
          }
        };
        label.onRemove = () => node.remove();
        label.setMap(current);
        objects.push(label);
      }
    }
    if (props.points?.length) {
      objects.push(
        new sdk.Polyline({
          map: current,
          path: props.points,
          strokeColor: "#ffffff",
          strokeWeight: 3,
          clickable: false,
        }),
      );
      if (props.points.length >= 3)
        objects.push(
          new sdk.Polygon({
            map: current,
            paths: props.points,
            fillColor: "#2563eb",
            fillOpacity: 0.2,
            strokeColor: "#ffffff",
            clickable: false,
            zIndex: 6,
          }),
        );
    }
    return () => {
      listeners.forEach((l) => l.remove());
      objects.forEach((object) => object.setMap(null));
    };
  }, [
    sdk,
    props.plan.zones,
    props.plan.lots,
    props.selected,
    props.tool,
    props.moveAll,
    props.placementMode,
    props.showImage,
    props.points,
    props.publicView,
    zoom,
  ]);

  useEffect(() => {
    if (!sdk || !map.current || !props.showImage) return;
    const images = [
      ...(props.plan.image ? [props.plan.image] : []),
      ...(props.images ?? []),
    ];
    const overlays = images.map((image) =>
      imageOverlay(sdk, map.current!, image),
    );
    return () => overlays.forEach((overlay) => overlay.setMap(null));
  }, [
    sdk,
    props.plan.image,
    props.images,
    props.showImage,
  ]);

  useEffect(() => {
    const current = map.current;
    if (!sdk || !current || !props.markers) return;
    const activeMap: GoogleMap = current;
    const mapZoom = Math.round(activeMap.getZoom() ?? zoom);
    const visible = props.markers.filter(
      (marker) => !(props.hideFocusedMarker && marker.id === props.markerFocusId),
    );
    const groups: MarkerGroup[] =
      props.clusterMarkers === false || mapZoom >= MAX_CLUSTER_ZOOM
        ? visible.map((marker) => ({
            center: { lat: marker.lat, lng: marker.lng },
            markers: [marker],
          }))
        : groupMarkers(
            visible,
            mapZoom,
            mapZoom <= PRICE_MAX_ZOOM ? PRICE_CLUSTER_PX : CLUSTER_PX,
          );

    function markerNode(marker: PlanMapMarker) {
      const focused = marker.id === props.markerFocusId;
      const showPrice = props.clusterMarkers === false || !marker.iconUrl || mapZoom <= PRICE_MAX_ZOOM;
      const node = document.createElement("button");
      node.type = "button";
      node.title = marker.title;
      node.setAttribute("aria-label", `${marker.title}: ${marker.priceLabel}`);
      Object.assign(node.style, {
        position: "absolute",
        transform: "translate(-50%,-100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "4px",
        background: "transparent",
        border: "none",
        padding: "0",
        font: "bold 11px sans-serif",
        whiteSpace: "nowrap",
        cursor: "pointer",
      });
      if (showPrice) {
        const label = document.createElement("span");
        label.textContent = marker.priceLabel;
        Object.assign(label.style, {
          display: "block",
          background: focused ? "#1974f4" : "#ffffff",
          color: focused ? "#ffffff" : "#193445",
          border: "2px solid #1974f4",
          borderRadius: "20px",
          padding: "6px 10px",
          lineHeight: "1",
          boxShadow: "0 3px 12px #0003",
        });
        node.append(label);
      }
      if (marker.iconUrl) {
        const icon = document.createElement('img');
        icon.src = marker.iconUrl; icon.alt = ''; icon.width = 46; icon.height = 46;
        Object.assign(icon.style, { width: '46px', height: '46px', objectFit: 'contain', display: 'block', filter: focused ? 'drop-shadow(0 3px 5px #2563eb)' : 'drop-shadow(0 2px 3px #0004)' });
        node.append(icon);
      }
      ["mousedown", "touchstart", "pointerdown"].forEach((name) =>
        node.addEventListener(name, (event) => event.stopPropagation()),
      );
      node.addEventListener("click", (event) => {
        event.stopPropagation();
        callbacks.current.onMarkerSelect?.(marker.id);
        activeMap.panTo(marker);
        activeMap.setZoom(18);
      });
      return node;
    }

    function clusterNode(group: MarkerGroup) {
      const count = group.markers.length;
      const priced = group.markers.filter(
        (marker) =>
          typeof marker.priceAmount === "number" && marker.priceCurrency,
      );
      const currencies = new Set(
        group.markers.map((marker) => marker.priceCurrency),
      );
      const clusterPrice =
        priced.length === group.markers.length && currencies.size === 1
          ? formatPrice(
              Math.min(
                ...priced.map((marker) => marker.priceAmount as number),
              ),
              [...currencies][0] ?? "PEN",
            )
          : null;
      const node = document.createElement("button");
      node.type = "button";
      node.title = group.markers.map((marker) => marker.title).join(" · ");
      node.setAttribute(
        "aria-label",
        `${count} proyectos en esta zona.${
          clusterPrice ? ` Desde ${clusterPrice}.` : ""
        } Acercar para verlos.`,
      );
      const baseShadow = "0 8px 22px #00124f2e, 0 2px 6px #00124f1a";
      const hoverShadow = "0 12px 28px #00124f3d, 0 3px 8px #00124f24";
      Object.assign(node.style, {
        position: "absolute",
        transform: "translate(-50%,-50%)",
        display: "flex",
        alignItems: "center",
        gap: "9px",
        padding: "6px 16px 6px 7px",
        borderRadius: "9999px",
        border: "1px solid #dbe7f5",
        background: "#ffffff",
        color: "#193445",
        boxShadow: baseShadow,
        cursor: "pointer",
        font: "600 13px/1.15 sans-serif",
        whiteSpace: "nowrap",
        transition: "transform 120ms ease, box-shadow 120ms ease",
        zIndex: "2",
      });

      const badge = document.createElement("span");
      Object.assign(badge.style, {
        width: "34px",
        height: "34px",
        borderRadius: "9999px",
        display: "grid",
        placeItems: "center",
        background: "linear-gradient(145deg, #2f8bff, #1560d8)",
        boxShadow: "inset 0 0 0 1px #ffffff40",
        flex: "0 0 auto",
      });
      badge.innerHTML =
        '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 21s7-5.34 7-11a7 7 0 1 0-14 0c0 5.66 7 11 7 11Z" stroke="#fff" stroke-width="2" stroke-linejoin="round"/><circle cx="12" cy="10" r="2.5" fill="#fff"/></svg>';

      const text = document.createElement("span");
      Object.assign(text.style, {
        display: "flex",
        flexDirection: "column",
        gap: "1px",
        textAlign: "left",
      });
      const titleText = document.createElement("span");
      titleText.textContent = `${count} proyectos`;
      Object.assign(titleText.style, {
        fontWeight: "700",
        fontSize: "13px",
        color: "#193445",
      });
      const hint = document.createElement("span");
      hint.textContent = clusterPrice
        ? `Desde ${clusterPrice}`
        : "Toca para acercar";
      Object.assign(hint.style, {
        fontWeight: clusterPrice ? "700" : "500",
        fontSize: "10px",
        color: clusterPrice ? "#1974f4" : "#6b8199",
      });
      text.append(titleText, hint);
      node.append(badge, text);

      node.addEventListener("mouseenter", () => {
        node.style.transform = "translate(-50%,-50%) scale(1.04)";
        node.style.boxShadow = hoverShadow;
      });
      node.addEventListener("mouseleave", () => {
        node.style.transform = "translate(-50%,-50%)";
        node.style.boxShadow = baseShadow;
      });
      ["mousedown", "touchstart", "pointerdown"].forEach((name) =>
        node.addEventListener(name, (event) => event.stopPropagation()),
      );
      node.addEventListener("click", (event) => {
        event.stopPropagation();
        const target = Math.max(
          mapZoom + 1,
          zoomToSeparate(group.markers, mapZoom),
        );
        activeMap.panTo(group.center);
        activeMap.setZoom(target);
      });
      return node;
    }

    const overlays = groups.map((group) => {
      const overlay = new sdk.OverlayView();
      const clustered = group.markers.length > 1;
      const node = clustered ? clusterNode(group) : markerNode(group.markers[0]);
      overlay.onAdd = () => {
        overlay.getPanes()?.overlayMouseTarget.append(node);
      };
      overlay.draw = () => {
        const pixel = overlay
          .getProjection()
          .fromLatLngToDivPixel(
            new sdk.LatLng(group.center.lat, group.center.lng),
          );
        if (pixel) {
          node.style.left = `${pixel.x}px`;
          node.style.top = `${pixel.y}px`;
        }
      };
      overlay.onRemove = () => node.remove();
      overlay.setMap(activeMap);
      return overlay;
    });
    return () => overlays.forEach((overlay) => overlay.setMap(null));
  }, [sdk, props.markers, props.markerFocusId, props.hideFocusedMarker, props.clusterMarkers, zoom]);

  useEffect(() => {
    const current = map.current;
    if (!sdk || !current || !props.markers) return;
    if (props.focusProject) {
      current.panTo(props.center);
      current.setZoom(18);
      return;
    }
    if (props.markers.length && !props.overviewBounds?.length) {
      fitMarkers(current, sdk, props.markers);
    } else if (props.overviewBounds?.length) {
      const overview = new sdk.LatLngBounds();
      props.overviewBounds.forEach(point => overview.extend(point));
      current.fitBounds(overview);
    } else {
      current.panTo(props.center);
      current.setZoom(11);
    }
  }, [sdk, props.markers, props.center, props.focusProject, props.overviewBounds]);

  useEffect(() => {
    const marker = props.markers?.find(
      (item) => item.id === props.markerFocusId,
    );
    if (marker && map.current) {
      map.current.panTo(marker);
      map.current.setZoom(18);
    }
    // Focus responds to list selection, without moving the camera on data refresh.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sdk, props.markerFocusId]);

  useEffect(() => {
    if (!map.current || !sdk) return;
    if (props.selected) {
      const shape =
        props.plan.lots.find((l) => l.id === props.selected) ??
        props.plan.zones.find((z) => z.id === props.selected);
      if (shape?.path.length) {
        const bounds = new sdk.LatLngBounds();
        shape.path.forEach((p) => bounds.extend(p));
        map.current.fitBounds(bounds);
        if ((map.current.getZoom() ?? 0) > 22) map.current.setZoom(22);
      }
    }
    // Selecting a new item focuses it; editing its vertices does not move the camera.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.selected, sdk]);

  useEffect(() => {
    const lot = props.publicView
      ? props.plan.lots.find(item => item.id === props.selected)
      : undefined;
    const center = lot ? polygonCenter(lot.path) : undefined;
    if (!sdk || !map.current || !lot || !center) return;

    const marker = new sdk.OverlayView();
    const node = document.createElement("div");
    node.className = styles.selectedLotMarker;
    node.setAttribute("role", "img");
    node.setAttribute("aria-label", `Lote ${lot.code} seleccionado`);
    const icon = document.createElement("img");
    icon.src = "/web_v/ubicacion.png";
    icon.alt = "";
    icon.width = 30;
    icon.height = 30;
    node.append(icon);

    marker.onAdd = () => {
      marker.getPanes()?.overlayMouseTarget.append(node);
    };
    marker.draw = () => {
      const pixel = marker
        .getProjection()
        .fromLatLngToDivPixel(new sdk.LatLng(center.lat, center.lng));
      if (pixel) {
        node.style.left = `${pixel.x}px`;
        node.style.top = `${pixel.y}px`;
      }
    };
    marker.onRemove = () => node.remove();
    marker.setMap(map.current);
    return () => marker.setMap(null);
  }, [sdk, props.publicView, props.selected, props.plan.lots]);

  useEffect(() => {
    if (props.mapCenterRequest && map.current) {
      map.current.panTo(props.center);
      map.current.setZoom(18);
    }
  }, [props.mapCenterRequest, props.center, sdk]);
  useEffect(() => {
    if (!props.focusPlanRequest || !map.current || !sdk) return;
    const plan = callbacks.current.plan;
    const points = [...plan.lots.flatMap(l => l.path), ...plan.zones.flatMap(z => z.path)];
    if (!points.length && plan.image) {
      const image = plan.image;
      const angle = (image.rotation * Math.PI) / 180;
      const imageCorner = (x: number, y: number): Point => {
        const east = x * Math.cos(angle) + y * Math.sin(angle);
        const north = -x * Math.sin(angle) + y * Math.cos(angle);
        return {
          lat: image.center.lat + north / 111320,
          lng: image.center.lng +
            east / (111320 * Math.cos((image.center.lat * Math.PI) / 180)),
        };
      };
      points.push(
        imageCorner(-image.widthM / 2, image.heightM / 2),
        imageCorner(image.widthM / 2, image.heightM / 2),
        imageCorner(-image.widthM / 2, -image.heightM / 2),
        imageCorner(image.widthM / 2, -image.heightM / 2),
      );
    }
    if (!points.length) return;
    const bounds = new sdk.LatLngBounds();
    points.forEach(p => bounds.extend(p));
    const radius = callbacks.current.planContextRadiusM;
    if (radius && radius > 0) {
      const minLat = Math.min(...points.map(point => point.lat));
      const maxLat = Math.max(...points.map(point => point.lat));
      const minLng = Math.min(...points.map(point => point.lng));
      const maxLng = Math.max(...points.map(point => point.lng));
      const lat = (minLat + maxLat) / 2;
      const lng = (minLng + maxLng) / 2;
      const latSpan = Math.max((maxLat - minLat) * .8, radius / 111320);
      const lngSpan = Math.max((maxLng - minLng) * .8, radius / (111320 * Math.max(.1, Math.cos(lat * Math.PI / 180))));
      bounds.extend({ lat: lat - latSpan, lng: lng - lngSpan });
      bounds.extend({ lat: lat + latSpan, lng: lng + lngSpan });
    }
    map.current.fitBounds(bounds);
  }, [props.focusPlanRequest, sdk]);
  useEffect(() => {
    map.current?.setOptions({ mapTypeControl: !props.minimalControls && !props.compactMapControl });
  }, [sdk, props.minimalControls, props.compactMapControl]);
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-edge bg-surface-muted ${props.compactMapControl ? styles.compactControls : ''} ${props.className ?? "min-h-[640px]"}`}
    >
      <div
        ref={host}
        className="absolute inset-0"
        aria-label="Mapa interactivo del plano y lotes"
      />
      {props.compactMapControl && <div className="absolute left-3 top-3 z-10 inline-flex overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm" role="group" aria-label="Tipo de mapa">
        <button type="button" className="px-3 py-1.5 text-[11px] font-semibold text-slate-700 hover:bg-blue-50" onClick={() => map.current?.setMapTypeId('roadmap')}>Mapa</button>
        <button type="button" className="border-l border-slate-200 px-3 py-1.5 text-[11px] font-semibold text-slate-700 hover:bg-blue-50" onClick={() => map.current?.setMapTypeId('satellite')}>Satélite</button>
      </div>}
      {!sdk && !error && (
        <div
          role="status"
          className="absolute inset-0 grid place-items-center bg-surface-muted text-muted"
        >
          Cargando Google Maps…
        </div>
      )}
      {error && (
        <div
          role="alert"
          className="absolute inset-0 flex items-center justify-center bg-surface-muted p-8 text-center text-sm text-red-700"
        >
          {error}
        </div>
      )}
      <div className={`${props.hideLegendOnMobile ? styles.hideLegendOnMobile : ''} pointer-events-none absolute bottom-9 left-3 flex flex-wrap gap-2 rounded-xl bg-white/95 p-3 text-[11px] text-slate-700 shadow-sm`}>
        {(props.legendStatuses ?? ['RESERVED', 'SOLD', 'BLOCKED'] as const).map(status => (
          <span key={status} className="flex items-center gap-1">
            <i
              className="size-2.5 rounded-full"
              style={{ background: LOT_COLORS[status] }}
            />
            {
              {
                AVAILABLE: "Disponible",
                RESERVED: "Reservado",
                SOLD: "Vendido",
                BLOCKED: "Bloqueado",
              }[status]
            }
          </span>
        ))}
        {props.legendAction && <div className="pointer-events-auto ml-2 border-l border-slate-200 pl-3">{props.legendAction}</div>}
      </div>
    </div>
  );
}
