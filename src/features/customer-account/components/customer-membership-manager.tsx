"use client";

import Link from "next/link";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, CardContent, CardHeader, CardTitle, CheckIcon, WhatsappIcon } from "@/shared/ui";
import { ApiError } from "@/shared/lib/api/client";
import { env } from "@/shared/lib/env";
import { ROUTES } from "@/shared/config/routes";
import { buildArizWhatsappUrl } from "@/shared/lib/whatsapp";
import {
  requestCustomerMembership,
  uploadCustomerPaymentReceipt,
} from "@/features/customer-account/api/client";
import { PublicationCountdown } from "@/features/customer-account/components/publication-countdown";
import {
  CUSTOMER_TRIAL_PLAN_SLUG,
  type CustomerMembership,
} from "@/features/customer-account/types/customer-account";
import { UnlimitedPlanCard } from "@/features/shared/components/unlimited-plan-card";

function daysRemaining(expiresAt: string | null): number {
  if (!expiresAt) return 0;
  return Math.max(0, Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 86_400_000));
}

const PRICING: Record<number, { 15: number; 30: number }> = {
  1: { 15: 80, 30: 150 },
  2: { 15: 120, 30: 225 },
  5: { 15: 200, 30: 350 },
};

interface PackageOption {
  propertyLimit: number;
  label: string;
  features15: string[];
  features30: string[];
}

const PACKAGES: PackageOption[] = [
  {
    propertyLimit: 1,
    label: "1 propiedad",
    features15: ["1 propiedad activa", "15 días de publicación", "Perfil profesional"],
    features30: ["1 propiedad activa", "30 días de publicación", "Perfil profesional"],
  },
  {
    propertyLimit: 2,
    label: "2 propiedades",
    features15: ["2 propiedades activas", "15 días de publicación", "Gestión de leads", "Contacto directo"],
    features30: ["2 propiedades activas", "30 días de publicación", "1 proyecto activo", "Gestión de leads"],
  },
  {
    propertyLimit: 5,
    label: "+5 propiedades",
    features15: ["+5 propiedades activas", "15 días de publicación", "2 proyectos activos", "Mayor visibilidad", "Estadísticas completas"],
    features30: ["+5 propiedades activas", "30 días de publicación", "2 proyectos activos", "Mayor visibilidad", "Estadísticas completas"],
  },
];

export function CustomerMembershipManager({
  membership,
  customerName,
}: {
  membership: CustomerMembership;
  customerName: string;
}) {
  const router = useRouter();
  const [selectedPkg, setSelectedPkg] = useState(0);
  const [durations, setDurations] = useState<Record<number, 15 | 30>>({ 0: 30, 1: 30, 2: 30 });
  const [receipt, setReceipt] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const subscription = membership.subscription;
  const active = subscription?.status === "ACTIVE";
  const freeTrialActive =
    active && subscription.plan.slug === CUSTOMER_TRIAL_PLAN_SLUG;
  const pending = subscription?.status === "PENDING_PAYMENT";

  const currentPkg = PACKAGES[selectedPkg];
  const currentDuration = durations[selectedPkg];
  const currentPrice = PRICING[currentPkg.propertyLimit][currentDuration];
  const currentPropertyLimit = currentPkg.propertyLimit;
  const currentFeatures = currentDuration === 15 ? currentPkg.features15 : currentPkg.features30;

  function toggleDuration(index: number, value: 15 | 30) {
    setDurations((prev) => ({ ...prev, [index]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!receipt) {
      setError("Adjunta el comprobante del pago para continuar.");
      return;
    }
    setError("");
    setSent(false);
    setSubmitting(true);

    try {
      const uploaded = await uploadCustomerPaymentReceipt(receipt);
      await requestCustomerMembership({
        propertyLimit: currentPropertyLimit,
        durationDays: currentDuration,
        price: currentPrice,
        receiptUrl: uploaded.url,
      });
      setSent(true);
      setReceipt(null);
      router.refresh();
    } catch (requestError) {
      setError(
        requestError instanceof ApiError
          ? requestError.message
          : "No se pudo enviar la solicitud. Inténtalo de nuevo.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  function handleReceiptChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    if (file && (!["image/png", "image/jpeg", "application/pdf"].includes(file.type) || file.size > 10 * 1024 * 1024)) {
      setError("El comprobante debe ser JPG, PNG o PDF y no superar 10 MB.");
      event.target.value = "";
      setReceipt(null);
      return;
    }
    setError("");
    setReceipt(file);
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="relative overflow-hidden rounded-card border border-edge bg-brand p-6 text-white shadow-[var(--shadow-card)] sm:p-8">
        <div className="absolute inset-x-0 top-0 h-1.5 bg-accent" aria-hidden />
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[11px] font-black tracking-[0.18em] text-accent uppercase">
              {active ? "Membresía actual" : pending ? "Solicitud de membresía" : "Publicación particular"}
            </p>
            <h2 className="mt-1 font-display text-2xl font-black tracking-tight sm:text-3xl">
              {membership.trialAvailable
                ? "Tu primera propiedad, gratis"
                : active
                  ? subscription.plan.name
                  : pending
                    ? "Comprobante en revisión"
                    : subscription?.status === "REJECTED"
                      ? "Solicitud no aprobada"
                      : subscription?.status === "EXPIRED"
                        ? "Tu período ha terminado"
                        : "Elige una membresía"}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/75">
              {membership.trialAvailable
                ? "Publica una propiedad durante 30 días sin costo. Después puedes elegir uno de los tres paquetes."
                : freeTrialActive
                  ? "Tu publicación gratuita está activa. Revisa cuánto tiempo queda antes de elegir un paquete."
                  : active
                    ? `Activa por ${daysRemaining(subscription.expiresAt)} días más. La vigencia de cada paquete es de 30 días.`
                    : pending
                      ? `Tu solicitud para ${subscription.plan.name} está esperando la aprobación del administrador.`
                      : subscription?.status === "REJECTED"
                        ? subscription.rejectionReason ?? "Puedes elegir un paquete y volver a enviar tu comprobante."
                        : "Cada paquete dura 30 días. Adjunta tu comprobante; los beneficios se habilitan cuando el administrador aprueba el pago."}
            </p>
            {freeTrialActive && subscription.expiresAt ? (
              <div className="mt-4 max-w-md rounded-card border border-white/20 bg-white p-4 text-brand">
                <PublicationCountdown
                  expiresAt={subscription.expiresAt}
                  label="Tiempo restante de tu periodo gratis"
                />
              </div>
            ) : null}
          </div>
          {active ? (
            <div className="shrink-0 rounded-card border border-white/20 bg-white/10 px-5 py-3 text-center">
              <p className="text-xs font-semibold text-white/70">Propiedades publicadas</p>
              <p className="mt-1 text-2xl font-black">
                {membership.propertyCount}/{subscription.plan.propertyLimit}
              </p>
            </div>
          ) : null}
        </div>
        {membership.trialAvailable ? (
          <Link
            href={ROUTES.panel.client.newProperty}
            className="mt-5 inline-flex h-11 items-center rounded-card bg-white px-5 text-sm font-bold text-brand transition-colors hover:bg-white/90"
          >
            Publicar mi primera propiedad
          </Link>
        ) : null}
        {active ? (
          <div className="mt-5">
            <Link href={ROUTES.panel.client.properties} className="text-sm font-semibold text-white underline underline-offset-4">
              Administrar mis propiedades
            </Link>
          </div>
        ) : null}
      </section>

      {!membership.trialAvailable && !active && !pending ? (
        <>
          <div>
            <p className="text-[11px] font-black tracking-[0.18em] text-accent uppercase">Planes para propietarios</p>
            <h2 className="mt-1 font-display text-2xl font-black tracking-tight text-brand sm:text-3xl">
              Elige el paquete para tus publicaciones
            </h2>
            <p className="mt-2 text-sm text-muted">
              Paquetes de 15 o 30 días. El administrador valida tu comprobante antes de activar el paquete.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {PACKAGES.map((pkg, index) => {
              const selected = selectedPkg === index;
              const cardDuration = durations[index] ?? 30;
              const cardPrice = PRICING[pkg.propertyLimit][cardDuration];
              const cardFeatures = cardDuration === 15 ? pkg.features15 : pkg.features30;

              return (
                <button
                  key={index}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setSelectedPkg(index)}
                  className={`relative flex min-h-96 flex-col overflow-hidden rounded-card border bg-surface text-left shadow-[var(--shadow-card)] transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-pop)] ${selected ? "border-brand ring-2 ring-brand/20" : "border-edge"
                    }`}
                >
                  <span className={`h-1.5 w-full ${selected ? "bg-brand" : "bg-accent"}`} aria-hidden />
                  {selected ? (
                    <span className="absolute right-4 top-4 rounded-full bg-success px-2.5 py-1 text-[10px] font-black tracking-wide text-white">
                      SELECCIONADO
                    </span>
                  ) : null}
                  <span className="flex flex-1 flex-col items-center gap-4 p-5 pt-7 text-center">
                    <span className="text-[11px] font-black tracking-wide text-muted uppercase">
                      {pkg.label}
                    </span>
                    <span className="font-display text-5xl font-black tracking-tight text-brand">
                      {pkg.propertyLimit === 5 ? "+5" : pkg.propertyLimit}
                    </span>
                    <span className="text-sm font-semibold text-ink">
                      {pkg.propertyLimit === 1 ? "propiedad activa" : "propiedades activas"}
                    </span>
                    <span className="w-full rounded-card border border-edge bg-canvas px-4 py-3">
                      <span className="block text-[11px] font-bold tracking-wide text-muted uppercase">
                        Elige vigencia
                      </span>
                      <div className="mt-2 flex gap-1">
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); toggleDuration(index, 15); }}
                          className={`flex-1 rounded-md px-2 py-1.5 text-xs font-bold transition-colors ${cardDuration === 15 ? "bg-brand text-on-brand" : "bg-surface-muted text-muted hover:text-ink"
                            }`}
                        >
                          15 días
                        </button>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); toggleDuration(index, 30); }}
                          className={`flex-1 rounded-md px-2 py-1.5 text-xs font-bold transition-colors ${cardDuration === 30 ? "bg-brand text-on-brand" : "bg-surface-muted text-muted hover:text-ink"
                            }`}
                        >
                          30 días
                        </button>
                      </div>
                      <span className="mt-2 block text-2xl font-black text-brand">
                        S/ {cardPrice}
                      </span>
                    </span>
                    <ul className="mt-2 flex w-full flex-col gap-1.5 text-left text-xs text-ink">
                      {cardFeatures.map((feature) => (
                        <li key={feature} className="flex items-start gap-2">
                          <CheckIcon className="mt-0.5 size-3.5 shrink-0 text-success" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      className="mt-auto"
                      onClick={(e) => { e.stopPropagation(); setSelectedPkg(index); }}
                      variant={selected ? "primary" : "secondary"}
                    >
                      {selected ? "Seleccionado" : "Elegir plan"}
                    </Button>
                  </span>
                </button>
              );
            })}
            <UnlimitedPlanCard customerName={customerName} userType="USER" />
          </div>

          <Card className="overflow-hidden">
            <div className="h-1.5 bg-brand" aria-hidden />
            <CardHeader>
              <p className="text-[11px] font-black tracking-[0.18em] text-accent uppercase">Siguiente paso</p>
              <CardTitle>Envía el comprobante de pago</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(300px,0.8fr)]">
                <div className="grid content-start gap-4">
                  <div className="rounded-card border border-edge bg-brand-soft p-4">
                    <p className="text-xs font-bold tracking-wide text-brand uppercase">Resumen de tu solicitud</p>
                    <p className="mt-2 text-lg font-bold text-brand">
                      {currentPkg.label} · {currentDuration} días
                    </p>
                    <p className="mt-1 text-sm text-muted">Total: S/ {currentPrice.toFixed(2)}</p>
                  </div>

                  {env.paymentConfigured ? (
                    <div className="rounded-card border border-edge bg-canvas p-4 text-sm text-muted">
                      <p className="mb-2 font-semibold text-ink">Datos para realizar el pago</p>
                      {env.payment.yapeNumber ? <p>Yape: {env.payment.yapeNumber}</p> : null}
                      {env.payment.plinNumber ? <p>Plin: {env.payment.plinNumber}</p> : null}
                      {env.payment.bankAccount ? (
                        <p>Transferencia · {env.payment.bankName}: {env.payment.bankAccount}</p>
                      ) : null}
                      {env.payment.accountHolder ? <p>Titular: {env.payment.accountHolder}</p> : null}
                    </div>
                  ) : (
                    <p className="rounded-card bg-warning/10 p-4 text-sm text-warning">
                      Los datos de pago aún no están configurados. Contacta con ARIZ antes de realizar
                      una transferencia.
                    </p>
                  )}
                </div>

                <div className="grid content-start gap-3">
                  <label className="grid gap-2 text-sm font-semibold text-brand">
                    Comprobante de pago
                    <input
                      type="file"
                      accept="image/png,image/jpeg,application/pdf"
                      onChange={handleReceiptChange}
                      className="rounded-card border border-edge bg-surface p-2 text-sm font-normal text-ink file:mr-3 file:rounded-md file:border-0 file:bg-brand-soft file:px-3 file:py-2 file:font-semibold file:text-brand"
                    />
                  </label>
                  <p className="text-xs text-muted">JPG, PNG o PDF · máximo 10 MB</p>
                  {receipt ? <p className="text-xs font-medium text-ink">{receipt.name}</p> : null}
                  {error ? <p role="alert" className="text-sm font-medium text-error">{error}</p> : null}
                  {sent ? (
                    <p role="status" className="text-sm font-medium text-success">
                      Comprobante enviado. La membresía se activará cuando el administrador apruebe el pago.
                    </p>
                  ) : null}
                  <Button type="submit" disabled={submitting || !env.paymentConfigured}>
                    {submitting ? "Enviando comprobante..." : "Enviar comprobante para revisión"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </>
      ) : null}

      <section className="rounded-card border border-edge bg-surface p-6 shadow-[var(--shadow-card)] sm:p-8">
        <p className="text-[11px] font-black tracking-[0.18em] text-accent uppercase">
          Contacto directo
        </p>
        <h2 className="mt-1 font-display text-2xl font-black tracking-tight text-brand sm:text-3xl">
          Servicios adicionales para ti
        </h2>
        <p className="mt-2 text-sm text-muted">
          Escríbenos por WhatsApp y un asesor te atenderá de inmediato.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <a
            href={buildArizWhatsappUrl(
              `Hola ARIZ, soy ${customerName}. Me gustaría conocer más sobre los convenios disponibles para miembros.`,
            )}
            target="_blank"
            rel="noreferrer"
            className="group flex flex-col items-center gap-3 rounded-card border border-edge bg-canvas p-5 text-center transition-all hover:-translate-y-0.5 hover:border-brand hover:shadow-[var(--shadow-card)]"
          >
            <span className="flex size-12 items-center justify-center rounded-full bg-[#25d366]/10 text-[#25d366] transition-colors group-hover:bg-[#25d366]/20">
              <WhatsappIcon className="size-6" />
            </span>
            <span className="text-base font-bold text-ink">Convenio con Ariz</span>
            <span className="text-xs text-muted">
              Consulta convenios exclusivos para miembros
            </span>
          </a>

          <a
            href={buildArizWhatsappUrl(
              `Hola ARIZ, soy ${customerName}. Tengo una consulta sobre mi membresía y mis publicaciones.`,
            )}
            target="_blank"
            rel="noreferrer"
            className="group flex flex-col items-center gap-3 rounded-card border border-edge bg-canvas p-5 text-center transition-all hover:-translate-y-0.5 hover:border-brand hover:shadow-[var(--shadow-card)]"
          >
            <span className="flex size-12 items-center justify-center rounded-full bg-[#25d366]/10 text-[#25d366] transition-colors group-hover:bg-[#25d366]/20">
              <WhatsappIcon className="size-6" />
            </span>
            <span className="text-base font-bold text-ink">Formulario WhatsApp</span>
            <span className="text-xs text-muted">
              Escríbenos tus dudas sobre tu cuenta
            </span>
          </a>

          <a
            href={buildArizWhatsappUrl(
              `Hola ARIZ, soy ${customerName}. Estoy interesado en el servicio de corretaje inmobiliario.`,
            )}
            target="_blank"
            rel="noreferrer"
            className="group flex flex-col items-center gap-3 rounded-card border border-edge bg-canvas p-5 text-center transition-all hover:-translate-y-0.5 hover:border-brand hover:shadow-[var(--shadow-card)]"
          >
            <span className="flex size-12 items-center justify-center rounded-full bg-[#25d366]/10 text-[#25d366] transition-colors group-hover:bg-[#25d366]/20">
              <WhatsappIcon className="size-6" />
            </span>
            <span className="text-base font-bold text-ink">Corretaje con Ariz</span>
            <span className="text-xs text-muted">
              Intermediación profesional en compraventas
            </span>
          </a>
        </div>
      </section>
    </div>
  );
}
