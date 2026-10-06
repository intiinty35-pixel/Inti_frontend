"use client";

import Image from "next/image";
import { ArrowUpRight, Coins, Gift, Sparkles } from "lucide-react";

interface RewardsHeroProps {
  referrerName: string;
  totalPoints: number;
  backgroundImageUrl?: string;
}

export function RewardsHero({ referrerName, totalPoints, backgroundImageUrl }: RewardsHeroProps) {
  return (
    <section className="relative mb-8 min-h-[500px] overflow-hidden rounded-3xl border border-brand/10 bg-brand shadow-[var(--shadow-pop)] sm:min-h-[520px] lg:min-h-[560px]">
      {backgroundImageUrl ? (
        <div className="absolute inset-x-0 top-0 h-[56%] overflow-hidden sm:inset-y-0 sm:left-auto sm:right-0 sm:h-auto sm:w-[56%]">
          <Image
            src={backgroundImageUrl}
            alt=""
            fill
            sizes="(max-width: 639px) 100vw, (max-width: 1279px) 56vw, 720px"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand via-brand/25 to-transparent sm:bg-gradient-to-r sm:from-brand sm:via-brand/15 sm:to-transparent" />
        </div>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-brand via-brand to-brand-hover" />
      )}

      <div aria-hidden="true" className="absolute inset-y-0 left-0 hidden w-2 bg-white/90 sm:block" />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 -top-24 size-72 rounded-full border border-white/20 sm:right-[28%] sm:-top-40 sm:size-[30rem]"
      />

      <div className="relative z-10 flex min-h-[500px] flex-col justify-between gap-8 p-6 sm:min-h-[520px] sm:flex-row sm:items-center sm:gap-6 sm:p-8 lg:min-h-[560px] lg:px-12">
        <div className="max-w-2xl pt-2 sm:pt-0">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3.5 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-white/90 backdrop-blur-sm sm:text-xs">
            <Sparkles className="size-4" />
            Tu espacio de recompensas
          </div>
          <h1 className="mt-5 break-words font-display text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
            Hola, {referrerName}
          </h1>
          <p className="mt-4 max-w-lg text-base leading-relaxed text-white/85 sm:text-lg">
            Cada recomendación suma. Descubre lo que puedes conseguir con tus puntos.
          </p>
          <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-white/90">
            <Gift className="size-4" />
            Recompensas exclusivas para ti
            <ArrowUpRight aria-hidden="true" className="size-4" />
          </div>
        </div>

        <div className="w-full max-w-sm rounded-2xl border border-white/70 bg-white p-6 text-brand shadow-[var(--shadow-pop)] sm:w-72 sm:shrink-0 sm:p-7">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-[0.16em] text-muted">
              Saldo disponible
            </span>
            <span className="flex size-9 items-center justify-center rounded-xl bg-accent/10">
              <Coins className="size-5 text-accent" />
            </span>
          </div>
          <p className="mt-5 font-display text-5xl font-bold leading-none tracking-tight text-brand sm:text-6xl">
            {totalPoints.toLocaleString("es-PE")}
          </p>
          <div className="mt-4 flex items-center justify-between border-t border-edge pt-3">
            <span className="text-sm font-semibold text-brand">Puntos Ariz</span>
            <span className="rounded-full bg-brand-soft px-2.5 py-1 text-[11px] font-bold text-brand">
              DISPONIBLES
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
