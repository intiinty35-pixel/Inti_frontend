import { PinIcon } from "@/shared/ui/icons";

/** El mapa interactivo real aún no está integrado; se muestra un aviso honesto en vez de un mapa falso. */
export function MapPlaceholderPanel() {
  return (
    <div className="sticky top-24 flex h-[420px] flex-col items-center justify-center gap-2 rounded-card border border-dashed border-edge bg-surface-muted p-6 text-center">
      <PinIcon className="size-8 text-brand/40" />
      <p className="text-sm font-bold text-ink">Mapa disponible próximamente</p>
      <p className="text-xs text-muted">
        Muy pronto podrás ver estas propiedades ubicadas en un mapa interactivo.
      </p>
    </div>
  );
}
