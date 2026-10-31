"use client";

import dynamic from "next/dynamic";
import { MapIcon } from "@/shared/ui";
import type { MapPoint } from "@/features/listings/components/listings-map";

const ProjectMap = dynamic<{ points: readonly MapPoint[]; className?: string }>(
  () =>
    import("@/features/home/components/openfreemap-project-map").then((module) => module.OpenFreeMapProjectMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full animate-pulse items-center justify-center bg-surface-muted">
        <MapIcon className="size-8 text-brand/25" />
      </div>
    ),
  },
);

export function AccountProjectMapPreview({
  points,
}: {
  points: readonly MapPoint[];
}) {
  return (
    <div role="region" aria-label="Mapa interactivo de proyectos INTI" className="group relative h-[65svh] min-h-[360px] max-h-[900px] w-full overflow-hidden bg-[#DDE8F7] sm:h-[70vh] sm:min-h-[520px]">
      <ProjectMap points={points} className="openfreemap-map h-full w-full" />

      <div className="pointer-events-none absolute left-4 top-4 flex items-center gap-2 rounded-full border border-white/70 bg-white/95 px-4 py-2.5 shadow-md backdrop-blur sm:left-6 sm:top-6">
        <span className="flex items-center gap-2 text-sm font-black text-brand">
          <MapIcon className="size-5 text-accent" />
          Mapa INTI
        </span>
      </div>

      {points.length === 0 ? (
        <div role="status" className="absolute bottom-4 left-4 max-w-[calc(100%-2rem)] rounded-2xl border border-white/80 bg-white/95 p-4 shadow-lg backdrop-blur sm:bottom-6 sm:left-6 sm:max-w-sm sm:p-5">
          <span className="grid size-10 place-items-center rounded-xl bg-accent/15 text-brand"><MapIcon className="size-5" /></span>
          <p className="mt-3 text-sm font-bold text-brand">Aún no hay proyectos que mostrar</p>
          <p className="mt-1 text-xs leading-relaxed text-muted">Cuando haya proyectos con ubicación, aparecerán aquí.</p>
        </div>
      ) : null}
    </div>
  );
}
