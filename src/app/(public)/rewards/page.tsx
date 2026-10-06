"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowRight, KeyRound, Gift, Coins, ShieldCheck } from "lucide-react";
import { Button, Input, Card, CardContent } from "@/shared/ui";
import { validateReferrerAccess, getRewardsCatalog, requestRedemption } from "@/features/rewards/api/client";
import type { Incentive, ReferrerAccess } from "@/features/rewards/types/rewards";
import { RewardsHero } from "@/features/rewards/components/rewards-hero";
import { HomeHeroBackground } from "@/features/home/components/home-hero-background";

export default function RewardsPage() {
  const [step, setStep] = useState<"code" | "catalog">("code");
  const [referralCode, setReferralCode] = useState("");
  const [access, setAccess] = useState<ReferrerAccess | null>(null);
  const [catalog, setCatalog] = useState<Incentive[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedIncentive, setSelectedIncentive] = useState<Incentive | null>(null);
  const [redeeming, setRedeeming] = useState(false);
  const [success, setSuccess] = useState(false);

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
        setAccess(result);
        const catalogData = await getRewardsCatalog();
        setCatalog(catalogData);
        setStep("catalog");
      } else {
        setError(result.message || "Código no válido");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al validar código");
    } finally {
      setLoading(false);
    }
  }

  async function handleRedeem() {
    if (!selectedIncentive || !access?.referrer) return;

    setRedeeming(true);
    setError(null);

    try {
      await requestRedemption(referralCode.trim(), selectedIncentive.id, 1);
      setSuccess(true);
      setSelectedIncentive(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al solicitar canje");
    } finally {
      setRedeeming(false);
    }
  }

  if (step === "code") {
    return (
      <section className="relative isolate -mt-[var(--header-h)] flex min-h-[100svh] w-full flex-1 items-center overflow-hidden px-4 pt-[calc(var(--header-h)+2rem)] pb-10 text-white sm:px-6 lg:px-8">
        <HomeHeroBackground />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 lg:hidden"
          style={{
            backgroundImage:
              "linear-gradient(180deg, rgb(4 15 52 / 0.5) 0%, rgb(4 15 52 / 0.72) 100%)",
          }}
        />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 hidden lg:block"
          style={{
            backgroundImage:
              "linear-gradient(90deg, rgb(4 15 52 / 0.88) 0%, rgb(4 15 52 / 0.76) 38%, rgb(4 15 52 / 0.45) 62%, rgb(4 15 52 / 0.2) 100%), linear-gradient(180deg, rgb(0 0 0 / 0.08) 0%, rgb(0 0 0 / 0.12) 100%)",
          }}
        />
        <span aria-hidden className="absolute inset-x-0 bottom-0 h-1 bg-accent" />

        <div className="relative z-10 mx-auto grid w-full max-w-[1180px] items-center gap-8 py-8 md:grid-cols-[minmax(0,1fr)_minmax(340px,440px)] md:gap-12 lg:gap-20">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-white backdrop-blur-sm sm:text-sm">
              <Gift className="size-4 text-accent" />
              Programa de referentes
            </div>
            <p className="mt-8 text-sm font-bold uppercase tracking-[0.15em] text-accent sm:text-base">
              Recomienda. Suma. Disfruta.
            </p>
            <h1 className="mt-3 max-w-2xl font-display text-4xl leading-[1.04] font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
              Compartir buenas oportunidades tiene recompensa.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed font-medium text-white/90 sm:text-lg">
              Ingresa con tu código, descubre tus puntos y canjéalos por beneficios exclusivos.
            </p>
            <div className="mt-8 flex items-center gap-3 text-sm font-semibold text-white/95 sm:text-base">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent text-on-accent">
                <Coins className="size-5" />
              </span>
              Cada recomendación te acerca a una nueva recompensa.
            </div>
          </div>

          <Card className="overflow-hidden rounded-2xl border-white/60 bg-surface shadow-[var(--shadow-pop)]">
            <CardContent className="p-6 sm:p-8">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-accent/15">
                <KeyRound className="size-7 text-accent" />
              </div>
              <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-brand">
                Tu espacio exclusivo
              </p>
              <div className="mt-2">
                <h2 className="font-display text-3xl font-bold leading-tight tracking-tight text-ink sm:text-4xl">
                  Catálogo de recompensas
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
                  Accede a tus beneficios con el código de referente que recibiste de Ariz.
                </p>
              </div>

              <form
                className="mt-7 flex flex-col gap-4"
                onSubmit={(event) => {
                  event.preventDefault();
                  void handleValidateCode();
                }}
              >
                <Input
                  label="Código de referente"
                  hint="Por ejemplo: REF-XXXXXXXX"
                  placeholder="REF-XXXXXXXX"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                  maxLength={12}
                  autoComplete="off"
                  className="h-12 font-mono tracking-wider"
                />
                {error && (
                  <p
                    role="alert"
                    className="rounded-lg bg-error/10 p-3 text-sm font-semibold text-error"
                  >
                    {error}
                  </p>
                )}
                <Button
                  type="submit"
                  disabled={loading}
                  className="h-12 w-full bg-accent font-bold text-on-accent shadow-[0_10px_26px_rgb(0_0_0_/_0.14)] hover:bg-accent-hover"
                >
                  {loading ? "Validando..." : "Acceder al catálogo"}
                  {!loading && <ArrowRight aria-hidden="true" className="size-4" />}
                </Button>
              </form>

              <div className="mt-6 flex items-start gap-3 border-t border-edge pt-5">
                <ShieldCheck className="mt-0.5 size-5 shrink-0 text-brand" />
                <p className="text-xs leading-relaxed text-muted">
                  Tu código es personal. Tus puntos y recompensas estarán disponibles al validar tu acceso.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  if (!access?.referrer) return null;

  const { totalPoints } = access.referrer;

  return (
    <div className="w-full flex-1 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <RewardsHero
        referrerName={access.referrer.name}
        totalPoints={totalPoints}
        backgroundImageUrl="/home/2.jpg"
      />

      {totalPoints === 0 && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-brand/20 bg-brand-soft/50 px-4 py-3">
          <Coins className="size-6 shrink-0 text-accent" />
          <p className="flex-1 text-sm text-ink">
            <span className="font-semibold">¡Empieza a referir!</span>{" "}
            <span className="text-muted">Comparte tu código para desbloquear recompensas.</span>
          </p>
        </div>
      )}

      <div className="mb-6">
        <h2 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          Elige tu próxima recompensa
        </h2>
        <p className="mt-1.5 text-sm text-muted sm:text-base">
          Canjea tus puntos por beneficios exclusivos.
        </p>
      </div>

      {catalog.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Gift className="mx-auto size-12 text-muted" />
            <p className="mt-4 text-lg font-semibold text-muted">
              No hay recompensas disponibles en este momento
            </p>
            <p className="mt-1 text-sm text-muted">
              Vuelve pronto para ver nuevas recompensas
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {catalog.map((incentive) => {
            const needsMorePoints = totalPoints < incentive.pointsRequired;
            const outOfStock = incentive.stock === 0;

            return (
              <Card
                key={incentive.id}
                className="flex flex-col overflow-hidden rounded-2xl border-edge transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-1 hover:border-brand/30 hover:shadow-[var(--shadow-pop)]"
              >
                {incentive.imageUrl && (
                  <div className="relative aspect-[16/10] overflow-hidden bg-surface-muted">
                    <Image
                      src={incentive.imageUrl}
                      alt={incentive.name}
                      fill
                      unoptimized
                      sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw"
                      className="object-cover"
                    />
                  </div>
                )}
                <CardContent className="flex flex-1 flex-col gap-2 p-3.5">
                  <div>
                    <h3 className="text-sm font-bold text-ink">{incentive.name}</h3>
                    <p className="mt-0.5 line-clamp-2 text-[11px] text-muted">
                      {incentive.promotion || incentive.description}
                    </p>
                  </div>

                  <div className="mt-auto flex flex-col gap-2">
                    <div className="flex items-center justify-between rounded-lg bg-brand-soft px-2.5 py-1">
                      <div className="flex items-center gap-1.5">
                        <Coins className="size-3.5 text-accent" />
                        <span className="text-[11px] font-bold text-brand">
                          {incentive.pointsRequired.toLocaleString("es-PE")} pts
                        </span>
                      </div>
                      <span className="text-[11px] text-muted">
                        {incentive.stock} disp.
                      </span>
                    </div>

                    {outOfStock ? (
                      <Button disabled className="h-8 w-full text-xs">
                        Agotado
                      </Button>
                    ) : needsMorePoints ? (
                      <div className="flex flex-col gap-1">
                        <Button disabled className="h-8 w-full text-xs">
                          Te faltan puntos
                        </Button>
                        <p className="text-center text-[10px] text-muted">
                          Tienes {totalPoints.toLocaleString("es-PE")} pts · Faltan{" "}
                          {(incentive.pointsRequired - totalPoints).toLocaleString("es-PE")} pts
                        </p>
                      </div>
                    ) : (
                      <Button
                        onClick={() => setSelectedIncentive(incentive)}
                        className="h-8 w-full text-xs"
                      >
                        Canjear ahora
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {selectedIncentive && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-brand/45 p-4 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget && !redeeming) {
              setSelectedIncentive(null);
              setError(null);
            }
          }}
        >
          <Card className="w-full max-w-md">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold text-ink">¿Quieres canjear esta recompensa?</h2>
              <div className="mt-4 rounded-xl bg-brand-soft p-4">
                <p className="text-lg font-bold text-ink">{selectedIncentive.name}</p>
                <p className="mt-1 text-sm text-muted">{selectedIncentive.description}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-sm font-bold text-brand">
                    -{selectedIncentive.pointsRequired.toLocaleString("es-PE")} puntos
                  </span>
                  <span className="text-xs text-muted">
                    Stock: {selectedIncentive.stock}
                  </span>
                </div>
              </div>
              <div className="mt-4 rounded-lg bg-surface-muted p-3">
                <p className="text-sm text-muted">
                  Después del canje tendrás:{" "}
                  <span className="font-bold text-ink">
                    {(totalPoints - selectedIncentive.pointsRequired).toLocaleString("es-PE")} puntos
                  </span>
                </p>
              </div>
              {error && (
                <p className="mt-3 rounded-lg bg-error/10 p-3 text-sm font-semibold text-error">
                  {error}
                </p>
              )}
              <div className="mt-6 flex gap-3">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setSelectedIncentive(null);
                    setError(null);
                  }}
                  disabled={redeeming}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleRedeem}
                  disabled={redeeming}
                  className="flex-1"
                >
                  {redeeming ? "Procesando..." : "Confirmar canje"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {success && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-brand/45 p-4 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setSuccess(false);
            }
          }}
        >
          <Card className="w-full max-w-md">
            <CardContent className="p-6 text-center">
              <div className="flex size-16 items-center justify-center rounded-full bg-success/10">
                <Gift className="size-8 text-success" />
              </div>
              <h2 className="mt-4 text-xl font-bold text-ink">¡Solicitud enviada!</h2>
              <p className="mt-2 text-sm text-muted">
                Tu solicitud de canje ha sido recibida. Te notificaremos cuando sea aprobada.
              </p>
              <Button
                onClick={() => setSuccess(false)}
                className="mt-6 w-full"
              >
                Continuar
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
