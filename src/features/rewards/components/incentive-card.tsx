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

        <CardContent className="flex flex-1 flex-col p-4 text-center">
          <div className="flex justify-center">
            <span
              className={`rounded-full px-2.5 py-1 text-[11px] font-black ${
                active ? "bg-success/10 text-success" : "bg-muted/15 text-muted"
              }`}
            >
              {active ? "Activo" : "Inactivo"}
            </span>
          </div>

          <h2 className="mt-3 line-clamp-2 break-words font-display text-lg font-black leading-tight text-brand">
            {incentive.name}
          </h2>
          <p className="mt-2 line-clamp-2 text-xs leading-5 text-muted">
            {incentive.description}
          </p>

          <div className="mt-5 grid grid-cols-2 gap-2 border-y border-edge py-3">
            <div>
              <Coins className="mx-auto size-4 text-accent" aria-hidden="true" />
              <p className="mt-1 text-[10px] font-black uppercase tracking-[0.12em] text-muted">
                Puntos
              </p>
              <p className="mt-1 text-lg font-black text-brand">
                {incentive.pointsRequired.toLocaleString("es-PE")}
              </p>
            </div>
            <div>
              <Package className={`mx-auto size-4 ${outOfStock ? "text-error" : "text-accent"}`} aria-hidden="true" />
              <p className="mt-1 text-[10px] font-black uppercase tracking-[0.12em] text-muted">
                Stock
              </p>
              <p className={`mt-1 text-lg font-black ${outOfStock ? "text-error" : "text-brand"}`}>
                {incentive.stock.toLocaleString("es-PE")}
              </p>
            </div>
          </div>

          <span className="mt-auto inline-flex h-10 items-center justify-center gap-2 pt-4 text-xs font-black text-brand">
            Editar incentivo
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </span>
        </CardContent>
      </Link>
    </Card>
  );
}
