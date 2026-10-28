"use client";

import Link from "next/link";
import { useFormStatus } from "react-dom";
import { ArrowUpRight, Coins, Gift, Package, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/shared/ui";
import { ROUTES } from "@/shared/config/routes";
import { deleteIncentive } from "@/features/rewards/api/actions";

interface IncentiveCardProps {
  incentive: {
    id: string;
    name: string;
    description: string;
    imageUrl?: string | null;
    pointsRequired: number;
    stock: number;
    status: string;
  };
}

function DeleteButton({ incentiveId }: { incentiveId: string }) {
  const { pending } = useFormStatus();

  async function handleDelete() {
    if (!confirm("¿Estás seguro de eliminar este incentivo? Esta acción no se puede deshacer.")) {
      return;
    }
    await deleteIncentive(incentiveId);
  }

  return (
    <form action={handleDelete} onClick={(event) => event.stopPropagation()}>
      <button
        type="submit"
        disabled={pending}
        className="absolute right-3 top-3 z-10 flex size-9 items-center justify-center rounded-xl bg-white/95 text-error shadow-[var(--shadow-card)] transition-all hover:bg-error hover:text-white disabled:opacity-50"
        aria-label="Eliminar incentivo"
      >
        {pending ? <span className="text-xs">...</span> : <Trash2 className="size-4" />}
      </button>
    </form>
  );
}

export function IncentiveCard({ incentive }: IncentiveCardProps) {
  const active = incentive.status === "ACTIVE";
  const outOfStock = incentive.stock === 0;

  return (
    <Card className="relative flex h-full min-w-0 flex-col overflow-hidden transition duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-pop)]">
      <DeleteButton incentiveId={incentive.id} />

      <Link href={`${ROUTES.panel.admin.incentives}/${incentive.id}`} className="flex h-full min-w-0 flex-col">
        {incentive.imageUrl ? (
          <div className="relative aspect-[16/10] overflow-hidden bg-surface-muted">
            {/* eslint-disable-next-line @next/next/no-img-element -- imagen externa de incentivo */}
            <img src={incentive.imageUrl} alt={incentive.name} className="size-full object-cover" />
          </div>
        ) : (
          <div className="flex aspect-[16/10] items-center justify-center bg-brand-soft text-brand">
            <Gift className="size-10" aria-hidden="true" />
          </div>
        )}

        <CardContent className="flex flex-1 flex-col px-2 py-1 text-center sm:p-4">
          <div className="flex justify-center">
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-black sm:px-2.5 sm:py-1 sm:text-[11px] ${
                active ? "bg-success/10 text-success" : "bg-muted/15 text-muted"
              }`}
            >
              {active ? "Activo" : "Inactivo"}
            </span>
          </div>

          <h2 className="mt-0.5 line-clamp-2 break-words font-display text-sm font-black leading-tight text-brand sm:mt-3 sm:text-lg">
            {incentive.name}
          </h2>
          <p className="mt-0.5 line-clamp-2 text-[10px] leading-4 text-muted sm:mt-2 sm:text-xs sm:leading-5">
            {incentive.description}
          </p>

          <div className="mt-1.5 grid grid-cols-2 gap-2 border-y border-edge py-1 sm:mt-5 sm:py-3">
            <div>
              <Coins className="mx-auto size-3.5 text-accent sm:size-4" aria-hidden="true" />
              <p className="mt-0.5 text-[9px] font-black uppercase tracking-[0.1em] text-muted sm:mt-1 sm:text-[10px] sm:tracking-[0.12em]">
                Puntos
              </p>
              <p className="mt-0.5 text-sm font-black text-brand sm:mt-1 sm:text-lg">
                {incentive.pointsRequired.toLocaleString("es-PE")}
              </p>
            </div>
            <div>
              <Package className={`mx-auto size-3.5 sm:size-4 ${outOfStock ? "text-error" : "text-accent"}`} aria-hidden="true" />
              <p className="mt-0.5 text-[9px] font-black uppercase tracking-[0.1em] text-muted sm:mt-1 sm:text-[10px] sm:tracking-[0.12em]">
                Stock
              </p>
              <p className={`mt-0.5 text-sm font-black sm:mt-1 sm:text-lg ${outOfStock ? "text-error" : "text-brand"}`}>
                {incentive.stock.toLocaleString("es-PE")}
              </p>
            </div>
          </div>

          <span className="mt-auto inline-flex h-7 items-center justify-center gap-1.5 pt-1 text-[10px] font-black text-brand sm:h-10 sm:gap-2 sm:pt-4 sm:text-xs">
            Editar incentivo
            <ArrowUpRight className="size-3.5 sm:size-4" aria-hidden="true" />
          </span>
        </CardContent>
      </Link>
    </Card>
  );
}
