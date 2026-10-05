"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { MapIcon } from "@/shared/ui";
import type { MapPoint } from "@/features/listings/components/listings-map";

const ProjectMap = dynamic<{ points: readonly MapPoint[]; className?: string }>(
  () =>
    import("@/features/listings/components/listings-map").then((module) => {
      const Inner = ({ points, className }: { points: readonly MapPoint[]; className?: string }) => (
        <module.ListingsMap points={points} className={className} interactive={false} compactPins />
      );
      return Inner;
    }),
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
  href,
}: {
  points: readonly MapPoint[];
  href: string;
}) {
  return (
    <Link
      href={href}
      aria-label="Ver proyectos en el mapa"
      className="group relative mx-auto block h-[380px] w-full max-w-[360px] overflow-hidden rounded-[8px] border border-white/70 bg-[#DDE8F7] shadow-[0_24px_60px_rgb(7_26_90_/_0.18)] transition-transform hover:-translate-y-1 sm:h-[420px] lg:h-[480px]"
    >
      {points.length > 0 ? (
        <ProjectMap points={points} className="h-full w-full" />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-surface-muted p-8 text-center">
          <MapIcon className="size-9 text-brand/40" />
          <span className="text-sm font-black text-brand">Mapa de proyectos</span>
        </div>
      )}

      <div className="absolute inset-x-5 top-5 flex items-center justify-between rounded-[8px] bg-white/90 px-4 py-3 shadow-sm backdrop-blur">
        <span className="flex items-center gap-2 text-sm font-black text-brand">
          <MapIcon className="size-5 text-accent" />
          Mapa ARIZ
        </span>
        <span className="text-[11px] font-bold text-muted">Proyectos</span>
      </div>

      <div className="absolute inset-x-5 bottom-5 rounded-[8px] bg-white/92 p-4 shadow-sm backdrop-blur transition-transform group-hover:-translate-y-1">
        <p className="text-[11px] font-black tracking-[0.14em] text-accent uppercase">
          Vista previa
        </p>
        <h3 className="mt-1 text-base font-black text-brand">Explora proyectos por zona</h3>
        <p className="mt-1 text-xs leading-relaxed text-muted">
          Haz clic para abrir el mapa de proyectos y revisar ubicaciones disponibles.
        </p>
      </div>
    </Link>
  );
}
