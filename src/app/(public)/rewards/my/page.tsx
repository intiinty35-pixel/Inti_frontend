"use client";

import { useState, useEffect } from "react";
import { Gift, Package } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, Button, Input } from "@/shared/ui";
import { validateReferrerAccess, getMyRedemptions } from "@/features/rewards/api/client";

const STATUS_STYLES = {
  PENDING: "bg-warning/10 text-warning",
  APPROVED: "bg-info/10 text-info",
  REJECTED: "bg-error/10 text-error",
  DELIVERED: "bg-success/10 text-success",
  CANCELLED: "bg-surface-muted text-muted",
} as const;

const STATUS_LABELS = {
  PENDING: "Pendiente",
  APPROVED: "Aprobado",
  REJECTED: "Rechazado",
  DELIVERED: "Entregado",
  CANCELLED: "Cancelado",
} as const;

export default function MyRedemptionsPage() {
  const [step, setStep] = useState<"code" | "redemptions">("code");
  const [referralCode, setReferralCode] = useState("");
  const [referrerName, setReferrerName] = useState("");
  const [redemptions, setRedemptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleValidateCode() {
    if (!referralCode.trim()) {
      setError("Ingresa tu código de referente");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await validateReferrerAccess(referralCode.trim());
      if (result.valid && result.referrer) {
        setReferrerName(result.referrer.name);
        const myRedemptions = await getMyRedemptions(referralCode.trim());
        setRedemptions(myRedemptions);
        setStep("redemptions");
      } else {
        setError(result.message || "Código no válido");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al validar código");
    } finally {
      setLoading(false);
    }
  }

  if (step === "code") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          <CardContent className="p-8">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="flex size-16 items-center justify-center rounded-full bg-brand-soft">
                <Package className="size-8 text-brand" />
              </div>
              <div>
                <h1 className="font-display text-3xl font-black text-brand">Mis Canjes</h1>
                <p className="mt-2 text-sm text-muted">
                  Ingresa tu código de referente para ver tus canjes
                </p>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-4">
              <Input
                placeholder="APCOD-XXXXXXXX"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                maxLength={12}
                className="h-14 text-center text-lg font-mono tracking-wider border-2 border-brand"
              />
              {error && (
                <p className="rounded-lg bg-error/10 p-3 text-sm font-semibold text-error">
                  {error}
                </p>
              )}
              <Button onClick={handleValidateCode} disabled={loading} className="h-12">
                {loading ? "Validando..." : "Ver mis canjes"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-black text-brand">Mis Canjes</h1>
        <p className="mt-1 text-sm text-muted">
          {referrerName} · {redemptions.length} canje{redemptions.length !== 1 ? "s" : ""}
        </p>
      </div>

      {redemptions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Gift className="mx-auto size-12 text-muted" />
            <p className="mt-4 text-lg font-semibold text-muted">
              No tienes canjes aún
            </p>
            <p className="mt-1 text-sm text-muted">
              Acumula puntos y canjea recompensas en nuestro catálogo
            </p>
            <Link href="/rewards">
              <Button className="mt-6">Ver catálogo</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {redemptions.map((redemption) => (
            <Card key={redemption.id} className="overflow-hidden">
              <CardContent className="flex flex-wrap items-center gap-4 p-5">
                {redemption.incentiveImageUrl && (
                  <img
                    src={redemption.incentiveImageUrl}
                    alt={redemption.incentiveName}
                    className="size-16 rounded-lg object-cover"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-lg font-bold text-ink">{redemption.incentiveName}</p>
                  <p className="mt-1 text-sm text-muted">
                    {new Date(redemption.requestedAt).toLocaleDateString("es-PE", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold uppercase tracking-wide text-muted">
                    Puntos
                  </p>
                  <p className="text-xl font-black text-brand">
                    {redemption.pointsSpent.toLocaleString("es-PE")}
                  </p>
                </div>
                <div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      STATUS_STYLES[redemption.status as keyof typeof STATUS_STYLES]
                    }`}
                  >
                    {STATUS_LABELS[redemption.status as keyof typeof STATUS_LABELS]}
                  </span>
                </div>
              </CardContent>
              {redemption.rejectionReason && (
                <div className="border-t border-edge bg-error/5 px-5 py-3">
                  <p className="text-xs font-bold uppercase tracking-wide text-error">
                    Motivo de rechazo
                  </p>
                  <p className="mt-1 text-sm text-ink">{redemption.rejectionReason}</p>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
