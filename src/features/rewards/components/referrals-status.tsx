"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Clock, Loader2, UserRound, XCircle } from "lucide-react";
import { Card, CardContent, Button } from "@/shared/ui";
import { getMyReferrals, type MyReferral, type ReferralStatus } from "@/features/referrals/api/client";

interface ReferralsStatusProps {
  /** Codigo del referente ya validado (ej. REF-80CF0F2B). */
  code: string;
  onTotalPointsChange?: (totalPoints: number) => void;
}

/** Etiqueta corta y cercana para cada estado del referido. */
const STATUS_LABELS: Record<ReferralStatus, string> = {
  PENDING_VALIDATION: "Validando",
  CONTACTED: "En proceso",
  VISIT: "Visita agendada",
  OPERATION_COMPLETED: "¡Compró!",
  REJECTED: "Rechazado",
};

/** Clases de color (badge) por estado, alineadas con los tokens del tema. */
const STATUS_BADGE_CLASS: Record<ReferralStatus, string> = {
  PENDING_VALIDATION: "bg-muted/10 text-muted",
  CONTACTED: "bg-info/10 text-info",
  VISIT: "bg-warning/10 text-warning",
  OPERATION_COMPLETED: "bg-success/10 text-success",
  REJECTED: "bg-error/10 text-error",
};

/** Icono por estado. */
const STATUS_ICON: Record<ReferralStatus, typeof Clock> = {
  PENDING_VALIDATION: Clock,
  CONTACTED: Clock,
  VISIT: UserRound,
  OPERATION_COMPLETED: CheckCircle2,
  REJECTED: XCircle,
};

function formatDate(value: string): string {
  try {
    return new Date(value).toLocaleDateString("es-PE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

/**
 * Panel "Tus referidos": muestra el avance de cada persona que uso el codigo
 * del referente (en proceso, visita o compro), con los puntos que ya sumo.
 */
export function ReferralsStatus({ code, onTotalPointsChange }: ReferralsStatusProps) {
  const [referrals, setReferrals] = useState<MyReferral[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Reset page when code changes
  useEffect(() => {
    setCurrentPage(1);
  }, [code]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    getMyReferrals(code)
      .then((result) => {
        if (!active) return;
        if (!result.valid) {
          setError(result.message ?? "No se pudieron cargar tus referidos.");
          setReferrals([]);
          return;
        }
        const nextReferrals = result.referrals ?? [];
        setReferrals(nextReferrals);
        onTotalPointsChange?.(
          nextReferrals.reduce((sum, referral) => sum + referral.points, 0),
        );
      })
      .catch((err: unknown) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : "No se pudieron cargar tus referidos.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [code, onTotalPointsChange]);

  return (
    <section className="mb-6">
      {loading ? (
        <Card>
          <CardContent className="flex items-center justify-center gap-2 py-10 text-sm text-muted">
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            Cargando tus referidos...
          </CardContent>
        </Card>
      ) : error ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted">{error}</CardContent>
        </Card>
      ) : referrals.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <UserRound className="mx-auto size-10 text-muted" aria-hidden="true" />
            <p className="mt-3 text-base font-semibold text-muted">
              Aún no tienes referidos
            </p>
            <p className="mt-1 text-sm text-muted">
              Comparte tu código para empezar a sumar puntos.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex flex-col gap-3">
            {referrals
              .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
              .map((referral) => {
                const Icon = STATUS_ICON[referral.status];
                return (
                  <Card key={referral.id} className="overflow-hidden">
                    <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-base font-bold text-ink">{referral.name}</p>
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${STATUS_BADGE_CLASS[referral.status]}`}
                          >
                            <Icon className="size-3.5 shrink-0" aria-hidden="true" />
                            {STATUS_LABELS[referral.status] ?? referral.statusLabel}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-muted">
                          Interés: {referral.interestLabel}
                          {referral.project ? ` · ${referral.project.name}` : ""}
                        </p>
                        <p className="mt-0.5 text-xs text-muted">
                          Referido el {formatDate(referral.createdAt)}
                        </p>
                        <details className="mt-3 group">
                          <summary className="cursor-pointer text-xs font-bold text-brand hover:underline">
                            Ver detalles
                          </summary>
                          <div className="mt-3 space-y-2 border-t border-edge pt-3">
                            <div className="flex items-center justify-between rounded-lg bg-surface-muted p-3">
                              <div>
                                <p className="text-xs font-bold uppercase tracking-wide text-muted">Estado actual</p>
                                <p className="text-sm font-semibold text-ink">{STATUS_LABELS[referral.status] ?? referral.statusLabel}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs font-bold uppercase tracking-wide text-muted">Puntos</p>
                                <p className="text-lg font-black text-brand">
                                  {referral.points > 0 ? `+${referral.points.toLocaleString("es-PE")}` : 'Pendiente'}
                                </p>
                              </div>
                            </div>
                            {referral.project && (
                              <div className="rounded-lg bg-surface-muted p-3">
                                <p className="text-xs font-bold uppercase tracking-wide text-muted">Proyecto de interés</p>
                                <p className="text-sm font-semibold text-ink">{referral.project.name}</p>
                              </div>
                            )}
                            <div className="rounded-lg bg-surface-muted p-3">
                              <p className="text-xs font-bold uppercase tracking-wide text-muted">Información de contacto</p>
                              <p className="text-sm text-ink">{referral.email}</p>
                              <p className="text-sm text-ink">{referral.phone}</p>
                            </div>
                          </div>
                        </details>
                      </div>
                      <div className="shrink-0 rounded-xl bg-brand-soft px-4 py-2 text-center sm:text-right">
                        <p className="text-[11px] font-bold uppercase tracking-wide text-muted">
                          Puntos
                        </p>
                        <p className="text-xl font-black text-brand">
                          {referral.points > 0 ? `+${referral.points.toLocaleString("es-PE")}` : '0'}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
          </div>
          {referrals.length > itemsPerPage && (
            <div className="flex items-center justify-between pt-4">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Anterior
              </Button>
              <p className="text-sm text-muted">
                Página {currentPage} de {Math.ceil(referrals.length / itemsPerPage)}
              </p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(Math.ceil(referrals.length / itemsPerPage), p + 1))}
                disabled={currentPage === Math.ceil(referrals.length / itemsPerPage)}
              >
                Siguiente
              </Button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
