import { MapIcon, PinIcon } from "@/shared/ui/icons";
import { cn } from "@/shared/lib/cn";

export interface MapMarker {
  id: string;
  price: string;
  lat?: number;
  lng?: number;
}

export interface MapPlaceholderProps {
  markers: readonly MapMarker[];
  className?: string;
}

/** Encuadre de Lima usado para convertir las coordenadas en porcentajes del panel. */
const BOUNDS = {
  minLat: -12.16,
  maxLat: -12.055,
  minLng: -77.085,
  maxLng: -76.93,
};

/** Separación mínima vertical (en %) entre dos pines cercanos. */
const MIN_GAP = 7;
const MIN_DX = 14;

const MAP_BACKGROUND = [
  "linear-gradient(rgb(0 18 79 / 0.06) 1px, transparent 1px)",
  "linear-gradient(90deg, rgb(0 18 79 / 0.06) 1px, transparent 1px)",
  "linear-gradient(118deg, transparent 44%, rgb(0 18 79 / 0.1) 44%, rgb(0 18 79 / 0.1) 46%, transparent 46%)",
  "linear-gradient(62deg, transparent 58%, rgb(0 18 79 / 0.08) 58%, rgb(0 18 79 / 0.08) 60%, transparent 60%)",
  "linear-gradient(200deg, transparent 66%, rgb(47 111 179 / 0.18) 66%, rgb(47 111 179 / 0.18) 76%, transparent 76%)",
  "radial-gradient(circle at 24% 28%, rgb(47 125 79 / 0.18) 0 7%, transparent 8%)",
  "radial-gradient(circle at 78% 62%, rgb(47 125 79 / 0.14) 0 5%, transparent 6%)",
].join(", ");

const MAP_BACKGROUND_SIZE = "44px 44px, 44px 44px, auto, auto, auto, auto, auto";

interface Position {
  x: number;
  y: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function toPercent(lat: number, lng: number): Position {
  return {
    x: clamp(((lng - BOUNDS.minLng) / (BOUNDS.maxLng - BOUNDS.minLng)) * 100, 8, 92),
    y: clamp((1 - (lat - BOUNDS.minLat) / (BOUNDS.maxLat - BOUNDS.minLat)) * 100, 10, 90),
  };
}

/** Aparta los pines que caen casi encima para que ninguno tape a otro. */
function spread(positions: readonly Position[]): Position[] {
  const placed: Position[] = [];

  return positions.map((position) => {
    let y = position.y;

    for (let attempt = 0; attempt < positions.length; attempt += 1) {
      const conflict = placed.find(
        (other) => Math.abs(other.x - position.x) < MIN_DX && Math.abs(other.y - y) < MIN_GAP,
      );

      if (!conflict) {
        break;
      }

      y = clamp(conflict.y + MIN_GAP, 10, 90);
    }

    const next = { x: position.x, y };
    placed.push(next);
    return next;
  });
}

/**
 * Mapa decorativo. Todavía no hay integración con Google Maps ni Leaflet:
 * el panel arma calles, áreas verdes y el río con gradientes y ubica los pines
 * con las coordenadas del preview para que el layout ya quede valido.
 */
export function MapPlaceholder({ markers, className }: MapPlaceholderProps) {
  const positions = spread(
    markers.map((marker) =>
      marker.lat === undefined || marker.lng === undefined
        ? { x: 50, y: 50 }
        : toPercent(marker.lat, marker.lng),
    ),
  );

  return (
    <div
      role="img"
      aria-label={`Vista previa del mapa con ${markers.length} propiedades`}
      className={cn(
        "relative h-full min-h-[420px] overflow-hidden rounded-card border border-edge bg-surface-muted",
        className,
      )}
      style={{ backgroundImage: MAP_BACKGROUND, backgroundSize: MAP_BACKGROUND_SIZE }}
    >
      {markers.map((marker, index) => {
        const position = positions[index];
        const flip = position.x > 60;

        return (
          <span
            key={marker.id}
            aria-hidden
            className="absolute"
            style={{ left: `${position.x}%`, top: `${position.y}%`, transform: "translate(-50%, -100%)" }}
          >
            <span className="flex size-7 items-center justify-center rounded-full bg-brand text-white ring-2 ring-white shadow-[var(--shadow-pop)]">
              <PinIcon className="size-3.5" />
            </span>
            <span
              className={cn(
                "absolute top-1/2 -translate-y-1/2 rounded-full bg-surface px-2 py-0.5 text-[10px] font-bold whitespace-nowrap text-brand ring-1 ring-edge shadow-[var(--shadow-card)]",
                flip ? "right-full mr-1.5" : "left-full ml-1.5",
              )}
            >
              {marker.price}
            </span>
          </span>
        );
      })}

      <span className="absolute top-4 right-4 rounded-full bg-surface px-3 py-1.5 text-[11px] font-bold text-brand ring-1 ring-edge shadow-[var(--shadow-card)]">
        {markers.length} propiedades
      </span>

      <span className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full bg-surface px-3 py-1.5 text-[11px] font-bold text-brand ring-1 ring-edge shadow-[var(--shadow-card)]">
        <MapIcon className="size-3.5" />
        Mapa interactivo · próximamente
      </span>
    </div>
  );
}
