"use client";

import Link from "next/link";
import { useFormStatus } from "react-dom";
import { Card, CardContent, TrashIcon } from "@/shared/ui";
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

  async function handleDelete(formData: FormData) {
    if (!confirm("¿Estás seguro de eliminar este incentivo? Esta acción no se puede deshacer.")) {
      return;
    }
    await deleteIncentive(incentiveId);
  }

  return (
    <form action={handleDelete} onClick={(e) => e.stopPropagation()}>
      <button
        type="submit"
        disabled={pending}
        className="absolute right-3 top-3 cursor-pointer rounded-full bg-white p-2 text-[#fa1d0b] transition-all hover:bg-[#fa1d0b] hover:text-white hover:scale-110 disabled:opacity-50"
        aria-label="Eliminar incentivo"
      >
        {pending ? (
          <span className="text-xs">...</span>
        ) : (
          <TrashIcon className="size-4" />
        )}
      </button>
    </form>
  );
}

export function IncentiveCard({ incentive }: IncentiveCardProps) {
  return (
    <Link href={`${ROUTES.panel.admin.incentives}/${incentive.id}`}>
      <Card className="relative h-full transition-shadow hover:shadow-lg">
        <CardContent className="flex flex-col gap-3 p-5">
          <DeleteButton incentiveId={incentive.id} />
          
          {incentive.imageUrl && (
            <div className="aspect-video overflow-hidden rounded-lg bg-surface-muted">
              <img
                src={incentive.imageUrl}
                alt={incentive.name}
                className="size-full object-cover"
              />
            </div>
          )}
          
          <div>
            <div className="flex items-start justify-between gap-2 pr-8">
              <p className="text-lg font-bold text-ink">{incentive.name}</p>
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-bold ${
                  incentive.status === "ACTIVE"
                    ? "bg-success/10 text-success"
                    : "bg-surface-muted text-muted"
                }`}
              >
                {incentive.status === "ACTIVE" ? "Activo" : "Inactivo"}
              </span>
            </div>
            <p className="mt-1 line-clamp-2 text-sm text-muted">
              {incentive.description}
            </p>
          </div>
          
          <div className="mt-auto flex items-center justify-between border-t border-edge pt-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-muted">
                Puntos
              </p>
              <p className="text-xl font-black text-brand">
                {incentive.pointsRequired.toLocaleString("es-PE")}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold uppercase tracking-wide text-muted">
                Stock
              </p>
              <p
                className={`text-xl font-black ${
                  incentive.stock === 0 ? "text-error" : "text-ink"
                }`}
              >
                {incentive.stock}
              </p>
            </div>
          </div>
          
          <button className="w-full cursor-pointer rounded-xl bg-brand-soft py-2.5 text-center transition-colors hover:bg-brand hover:text-on-brand">
            <p className="text-sm font-bold text-inherit">
              Editar incentivo →
            </p>
          </button>
        </CardContent>
      </Card>
    </Link>
  );
}
