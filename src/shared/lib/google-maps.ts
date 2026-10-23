import type { Point } from "./site-plan";

export interface MapListener {
  remove(): void;
}
export interface LatLng {
  lat(): number;
  lng(): number;
}
export interface MapEvent {
  latLng?: LatLng;
}
export interface MapPath {
  getArray(): LatLng[];
  addListener(name: string, cb: () => void): MapListener;
}
export interface GoogleMap {
  setOptions(options: Record<string, unknown>): void;
  setMapTypeId(type: string): void;
  addListener(name: string, cb: (event: MapEvent) => void): MapListener;
  panTo(point: Point): void;
  getCenter(): LatLng | undefined;
  fitBounds(bounds: MapBounds, padding?: number): void;
  getZoom(): number | undefined;
  setZoom(zoom: number): void;
}
interface MapBounds {
  extend(point: Point): void;
}
export interface MapPolygon {
  setOptions(options: Record<string, unknown>): void;
  setMap(map: GoogleMap | null): void;
  getPath(): MapPath;
  addListener(name: string, cb: (e: MapEvent) => void): MapListener;
}
export interface MapOverlay {
  setMap(map: GoogleMap | null): void;
  getPanes(): {
    overlayLayer: HTMLElement;
    overlayMouseTarget: HTMLElement;
  } | null;
  getProjection(): {
    fromLatLngToDivPixel(point: LatLng): { x: number; y: number } | null;
  };
  onAdd(): void;
  draw(): void;
  onRemove(): void;
}
export interface MapsSdk {
  Map: new (node: HTMLElement, options: Record<string, unknown>) => GoogleMap;
  Polygon: new (options: Record<string, unknown>) => MapPolygon;
  Polyline: new (options: Record<string, unknown>) => {
    setMap(map: GoogleMap | null): void;
  };
  OverlayView: new () => MapOverlay;
  LatLng: new (lat: number, lng: number) => LatLng;
  LatLngBounds: new () => MapBounds;
}
let loading: Promise<MapsSdk> | undefined;
export function loadGoogleMaps(key: string): Promise<MapsSdk> {
  if (!key) {
    console.error(
      "Configura NEXT_PUBLIC_GOOGLE_MAPS_API_KEY en el .env del frontend y reinicia la aplicación.",
    );
    return Promise.reject(new Error("No se pudieron cargar los datos..."));
  }
  const global = window as unknown as {
    google?: { maps: MapsSdk };
    arizMapsReady?: () => void;
    gm_authFailure?: () => void;
  };
  if (global.google?.maps) return Promise.resolve(global.google.maps);
  if (!loading)
    loading = new Promise<MapsSdk>((resolve, reject) => {
      const script = document.createElement("script");
      const fail = () => {
        loading = undefined;
        script.remove();
        console.error(
          "No se pudo cargar Google Maps. Revisa la clave, Maps JavaScript API y los dominios autorizados.",
        );
        reject(new Error("No se pudieron cargar los datos..."));
      };
      const timer = setTimeout(fail, 20000);
      global.arizMapsReady = () => {
        clearTimeout(timer);
        if (global.google?.maps) resolve(global.google.maps);
        else fail();
      };
      global.gm_authFailure = () => {
        clearTimeout(timer);
        fail();
        window.dispatchEvent(new Event("ariz-maps-auth-error"));
      };
      script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&callback=arizMapsReady&loading=async&v=weekly&language=es&region=PE`;
      script.async = true;
      script.onerror = () => {
        clearTimeout(timer);
        fail();
      };
      document.head.append(script);
    });
  return loading;
}
