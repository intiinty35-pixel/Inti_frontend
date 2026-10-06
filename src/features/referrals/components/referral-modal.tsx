'use client';

import { useEffect, useState } from 'react';
import { KeyRound, UserRoundPlus } from 'lucide-react';
import { createPortal } from 'react-dom';
import { Input } from '@/shared/ui/input';
import { Button } from '@/shared/ui/button';
import { Listbox } from '@/shared/ui/listbox';
import { submitPublicReferral, validateReferrerCode } from '@/features/referrals/api/client';

interface ReferralModalProps {
  open: boolean;
  onClose: () => void;
}

interface FormErrors {
  referrerName?: string;
  referrerEmail?: string;
  referrerPhone?: string;
  referrerCode?: string;
  name?: string;
  email?: string;
  phone?: string;
  interest?: string;
  availability?: string;
}

type ModalView = 'initial' | 'existing-code' | 'existing-form' | 'new-step1' | 'new-step2';

const INTEREST_OPTIONS = [
  { value: '', label: 'Selecciona una opción' },
  { value: 'VENTA', label: 'Venta' },
  { value: 'COMPRA', label: 'Compra' },
  { value: 'ALQUILER', label: 'Alquilar' },
  { value: 'COMPRA_LOTE', label: 'Comprar un lote' },
  { value: 'INVERSION', label: 'Invertir en un proyecto' },
  { value: 'CORRETAJE', label: 'Servicio de corretaje' },
] as const;

const AVAILABILITY_OPTIONS = [
  { value: '', label: 'Selecciona una opción' },
  { value: 'INMEDIATA', label: 'Inmediata' },
  { value: 'AVERIGUAR', label: 'Averiguar' },
  { value: 'POR_CONFIRMAR', label: 'Por confirmar' },
] as const;

const SELECT_TRIGGER =
  'h-11 rounded-card border border-edge bg-surface px-3 text-sm text-ink font-medium hover:border-brand/50';

export function ReferralModal({ open, onClose }: ReferralModalProps) {
  const [view, setView] = useState<ModalView>('initial');
  const [submitting, setSubmitting] = useState(false);
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const [referrerName, setReferrerName] = useState('');
  const [referrerEmail, setReferrerEmail] = useState('');
  const [referrerPhone, setReferrerPhone] = useState('');
  const [referrerCode, setReferrerCode] = useState('');
  const [validatedReferrer, setValidatedReferrer] = useState<{ id: string; name: string; email: string; phone: string } | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [interest, setInterest] = useState('');
  const [availability, setAvailability] = useState('');

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open || typeof document === 'undefined') return null;

  async function handleValidateCode() {
    if (!referrerCode.trim()) {
      setErrors({ referrerCode: 'Ingresa tu código de referente.' });
      return;
    }

    // Validar formato: REF-XXXXXXXX (12 caracteres)
    const codeRegex = /^REF-[A-Z0-9]{8}$/;
    if (!codeRegex.test(referrerCode.trim())) {
      setErrors({ referrerCode: 'Formato inválido. Debe ser REF-XXXXXXXX (12 caracteres).' });
      return;
    }

    setValidating(true);
    setError(null);
    setErrors({});

    try {
      const result = await validateReferrerCode(referrerCode.trim());
      if (result.valid && result.referrer) {
        setValidatedReferrer(result.referrer);
        setView('existing-form');
      } else {
        setErrors({ referrerCode: 'Código no válido. Verifica e intenta de nuevo.' });
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo validar el código.');
    } finally {
      setValidating(false);
    }
  }

  function validateNewStep1(): FormErrors {
    const next: FormErrors = {};
    if (!referrerName.trim()) next.referrerName = 'Ingresa tu nombre.';
    if (!referrerEmail.trim()) next.referrerEmail = 'Ingresa tu correo.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(referrerEmail)) next.referrerEmail = 'Ingresa un correo válido.';
    if (!referrerPhone.trim()) next.referrerPhone = 'Ingresa tu teléfono.';
    return next;
  }

  function validateNewStep2(): FormErrors {
    const next: FormErrors = {};
    if (!name.trim()) next.name = 'Ingresa el nombre del referido.';
    if (!email.trim()) next.email = 'Ingresa el correo del referido.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = 'Ingresa un correo válido.';
    if (!phone.trim()) next.phone = 'Ingresa el teléfono del referido.';
    if (!interest) next.interest = 'Selecciona una opción.';
    if (!availability) next.availability = 'Selecciona la disponibilidad.';
    return next;
  }

  function validateExistingForm(): FormErrors {
    const next: FormErrors = {};
    if (!name.trim()) next.name = 'Ingresa el nombre del referido.';
    if (!email.trim()) next.email = 'Ingresa el correo del referido.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = 'Ingresa un correo válido.';
    if (!phone.trim()) next.phone = 'Ingresa el teléfono del referido.';
    if (!interest) next.interest = 'Selecciona una opción.';
    if (!availability) next.availability = 'Selecciona la disponibilidad.';
    return next;
  }

  function handleNewStep1Next() {
    const step1Errors = validateNewStep1();
    setErrors(step1Errors);
    if (Object.keys(step1Errors).length === 0) {
      setView('new-step2');
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    
    let validationErrors: FormErrors;
    
    if (view === 'existing-form') {
      validationErrors = validateExistingForm();
    } else if (view === 'new-step2') {
      validationErrors = validateNewStep2();
    } else {
      return;
    }
    
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setSubmitting(true);
    setError(null);

    try {
      const payload = view === 'existing-form' && validatedReferrer
        ? {
            referrerName: validatedReferrer.name,
            referrerEmail: validatedReferrer.email,
            referrerPhone: validatedReferrer.phone,
            referrerCode: referrerCode.trim(),
            name: name.trim(),
            email: email.trim(),
            phone: phone.trim(),
            interest,
            availability,
          }
        : {
            referrerName: referrerName.trim(),
            referrerEmail: referrerEmail.trim(),
            referrerPhone: referrerPhone.trim(),
            referrerCode: referrerCode.trim() || undefined,
            name: name.trim(),
            email: email.trim(),
            phone: phone.trim(),
            interest,
            availability,
          };

      await submitPublicReferral(payload);
      setSuccess(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo registrar el referido.');
    } finally {
      setSubmitting(false);
    }
  }

  function handleClose() {
    if (submitting || validating) return;
    setSuccess(false);
    setError(null);
    setErrors({});
    setView('initial');
    setReferrerName('');
    setReferrerEmail('');
    setReferrerPhone('');
    setReferrerCode('');
    setValidatedReferrer(null);
    setName('');
    setEmail('');
    setPhone('');
    setInterest('');
    setAvailability('');
    onClose();
  }

  function handleBack() {
    if (view === 'existing-form') {
      setView('existing-code');
      setValidatedReferrer(null);
    } else if (view === 'new-step2') {
      setView('new-step1');
    } else {
      setView('initial');
    }
    setErrors({});
    setError(null);
  }

  function renderStepper(currentStep: number, totalSteps: number) {
    return (
      <div className="border-b border-edge px-6 py-4">
        <div className="flex items-center gap-3">
          {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
            <div key={step} className="flex items-center gap-3">
              <div className={`flex size-8 items-center justify-center rounded-full text-sm font-bold ${
                step === currentStep ? 'bg-brand text-on-brand' : 'bg-brand-soft text-brand'
              }`}>
                {step}
              </div>
              {step < totalSteps && (
                <div className="h-0.5 w-8 bg-edge">
                  <div className={`h-full bg-brand transition-all ${step < currentStep ? 'w-full' : 'w-0'}`} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-brand/45 p-4 backdrop-blur-sm"
      onMouseDown={(event) => event.target === event.currentTarget && handleClose()}
    >
      <section
        className="w-full max-w-md rounded-card border border-edge bg-surface shadow-[var(--shadow-pop)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="referral-modal-title"
      >
        <div className="flex items-start justify-between gap-4 border-b border-edge p-6">
          <div>
            <p className="text-[11px] font-black tracking-[0.18em] text-accent uppercase">
              Programa de referidos
            </p>
            <h2 id="referral-modal-title" className="mt-1 font-display text-2xl font-black text-brand">
              Refiere con Ariz
            </h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="text-2xl leading-none text-muted transition-colors hover:text-ink"
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        {success ? (
          <div className="p-6">
            <div className="rounded-lg bg-success/10 p-4">
              <p className="font-bold text-success">¡Referido registrado con éxito!</p>
              <p className="mt-1 text-sm text-muted">
                Te enviaremos actualizaciones sobre el estado de tu referido y tus puntos acumulados.
              </p>
              <Button onClick={handleClose} className="mt-4 w-full">
                Cerrar
              </Button>
            </div>
          </div>
        ) : view === 'initial' ? (
          <div className="flex flex-col gap-4 p-6">
            <p className="text-center text-sm text-muted">
              Selecciona una opción
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setView('existing-code')}
                className="group flex flex-col items-center gap-3 rounded-xl border-2 border-edge bg-surface p-5 text-center transition-all hover:border-brand hover:bg-brand-soft"
              >
                <div className="flex size-12 items-center justify-center rounded-full bg-brand-soft text-brand transition-colors group-hover:bg-brand group-hover:text-on-brand">
                  <KeyRound className="size-6" aria-hidden />
                </div>
                <div>
                  <p className="font-bold text-ink">Tengo código</p>
                  <p className="mt-1 text-xs text-muted">Ya soy referente</p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setView('new-step1')}
                className="group flex flex-col items-center gap-3 rounded-xl border-2 border-edge bg-surface p-5 text-center transition-all hover:border-brand hover:bg-brand-soft"
              >
                <div className="flex size-12 items-center justify-center rounded-full bg-brand-soft text-brand transition-colors group-hover:bg-brand group-hover:text-on-brand">
                  <UserRoundPlus className="size-6" aria-hidden />
                </div>
                <div>
                  <p className="font-bold text-ink">Soy nuevo</p>
                  <p className="mt-1 text-xs text-muted">Primera vez</p>
                </div>
              </button>
            </div>
          </div>
        ) : view === 'existing-code' ? (
          <div className="flex flex-col gap-4 p-6">
            <p className="text-sm text-muted text-center">
              Ingresa tu código de referente
            </p>
            <Input
              placeholder="REF-XXXXXXXX"
              value={referrerCode}
              onChange={(e) => setReferrerCode(e.target.value.toUpperCase())}
              error={errors.referrerCode}
              required
              maxLength={12}
              className="h-14 max-w-[220px] mx-auto text-center text-lg font-mono tracking-wider border-2 border-brand"
            />
            {error && (
              <p className="rounded-lg bg-error/10 p-3 text-sm font-semibold text-error">{error}</p>
            )}
            <div className="flex gap-3 w-full">
              <Button type="button" variant="secondary" onClick={handleBack} className="flex-1">
                Atrás
              </Button>
              <Button type="button" onClick={handleValidateCode} disabled={validating} className="flex-1">
                {validating ? 'Validando...' : 'Validar'}
              </Button>
            </div>
          </div>
        ) : view === 'existing-form' ? (
          <>
            <div className="border-b border-edge px-6 py-4">
              <p className="text-sm font-semibold text-ink">
                Datos del referido
              </p>
              {validatedReferrer && (
                <p className="mt-1 text-xs text-muted">
                  Referente: <span className="font-bold text-brand">{validatedReferrer.name}</span>
                </p>
              )}
            </div>
            <form onSubmit={handleSubmit} className="p-6">
              <div className="flex flex-col gap-4">
                <Input
                  label="Nombre del referido"
                  placeholder="Ej: María García"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  error={errors.name}
                  required
                />
                <Input
                  label="Correo del referido"
                  type="email"
                  placeholder="correo@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={errors.email}
                  required
                />
                <Input
                  label="Teléfono del referido"
                  placeholder="+51 999 999 999"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  error={errors.phone}
                  required
                />
                <div className="flex flex-col gap-1.5">
                  <span id="interest-label-existing" className="text-[13px] font-semibold text-brand">
                    ¿Qué desea hacer?
                  </span>
                  <Listbox
                    name="interest"
                    value={interest}
                    options={INTEREST_OPTIONS}
                    onValueChange={setInterest}
                    labelledBy="interest-label-existing"
                    triggerClassName={SELECT_TRIGGER}
                    listClassName="min-w-full"
                  />
                  {errors.interest && (
                    <p className="text-xs font-medium text-error">{errors.interest}</p>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <span id="availability-label-existing" className="text-[13px] font-semibold text-brand">
                    Disponibilidad
                  </span>
                  <Listbox
                    name="availability"
                    value={availability}
                    options={AVAILABILITY_OPTIONS}
                    onValueChange={setAvailability}
                    labelledBy="availability-label-existing"
                    triggerClassName={SELECT_TRIGGER}
                    listClassName="min-w-full"
                  />
                  {errors.availability && (
                    <p className="text-xs font-medium text-error">{errors.availability}</p>
                  )}
                </div>

                {error && (
                  <p className="rounded-lg bg-error/10 p-3 text-sm font-semibold text-error">{error}</p>
                )}

                <div className="mt-2 flex gap-3">
                  <Button type="button" variant="secondary" onClick={handleBack} className="flex-1">
                    Atrás
                  </Button>
                  <Button type="submit" disabled={submitting} className="flex-1">
                    {submitting ? 'Registrando...' : 'Registrar'}
                  </Button>
                </div>
              </div>
            </form>
          </>
        ) : view === 'new-step1' ? (
          <>
            {renderStepper(1, 2)}
            <div className="p-6">
              <p className="mb-4 text-sm font-semibold text-ink">
                Tus datos (referente)
              </p>
              <div className="flex flex-col gap-4">
                <Input
                  label="Nombre completo"
                  placeholder="Ej: Juan Pérez"
                  value={referrerName}
                  onChange={(e) => setReferrerName(e.target.value)}
                  error={errors.referrerName}
                  required
                />
                <Input
                  label="Correo electrónico"
                  type="email"
                  placeholder="tucorreo@ejemplo.com"
                  value={referrerEmail}
                  onChange={(e) => setReferrerEmail(e.target.value)}
                  error={errors.referrerEmail}
                  required
                />
                <Input
                  label="Teléfono"
                  placeholder="+51 999 999 999"
                  value={referrerPhone}
                  onChange={(e) => setReferrerPhone(e.target.value)}
                  error={errors.referrerPhone}
                  required
                />
                <div className="mt-2 flex gap-3">
                  <Button type="button" variant="secondary" onClick={handleBack} className="flex-1">
                    Atrás
                  </Button>
                  <Button type="button" onClick={handleNewStep1Next} className="flex-1">
                    Continuar
                  </Button>
                </div>
              </div>
            </div>
          </>
        ) : view === 'new-step2' ? (
          <>
            {renderStepper(2, 2)}
            <form onSubmit={handleSubmit} className="p-6">
              <p className="mb-4 text-sm font-semibold text-ink">
                Datos del referido
              </p>
              <div className="flex flex-col gap-4">
                <Input
                  label="Nombre del referido"
                  placeholder="Ej: María García"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  error={errors.name}
                  required
                />
                <Input
                  label="Correo del referido"
                  type="email"
                  placeholder="correo@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={errors.email}
                  required
                />
                <Input
                  label="Teléfono del referido"
                  placeholder="+51 999 999 999"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  error={errors.phone}
                  required
                />
                <div className="flex flex-col gap-1.5">
                  <span id="interest-label-new" className="text-[13px] font-semibold text-brand">
                    ¿Qué desea hacer?
                  </span>
                  <Listbox
                    name="interest"
                    value={interest}
                    options={INTEREST_OPTIONS}
                    onValueChange={setInterest}
                    labelledBy="interest-label-new"
                    triggerClassName={SELECT_TRIGGER}
                    listClassName="min-w-full"
                  />
                  {errors.interest && (
                    <p className="text-xs font-medium text-error">{errors.interest}</p>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <span id="availability-label-new" className="text-[13px] font-semibold text-brand">
                    Disponibilidad
                  </span>
                  <Listbox
                    name="availability"
                    value={availability}
                    options={AVAILABILITY_OPTIONS}
                    onValueChange={setAvailability}
                    labelledBy="availability-label-new"
                    triggerClassName={SELECT_TRIGGER}
                    listClassName="min-w-full"
                  />
                  {errors.availability && (
                    <p className="text-xs font-medium text-error">{errors.availability}</p>
                  )}
                </div>

                {error && (
                  <p className="rounded-lg bg-error/10 p-3 text-sm font-semibold text-error">{error}</p>
                )}

                <div className="mt-2 flex gap-3">
                  <Button type="button" variant="secondary" onClick={handleBack} className="flex-1">
                    Atrás
                  </Button>
                  <Button type="submit" disabled={submitting} className="flex-1">
                    {submitting ? 'Registrando...' : 'Registrar'}
                  </Button>
                </div>
              </div>
            </form>
          </>
        ) : null}
      </section>
    </div>,
    document.body,
  );
}
