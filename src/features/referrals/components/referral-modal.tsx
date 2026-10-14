'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { KeyRound, UserRoundPlus } from 'lucide-react';
import { createPortal } from 'react-dom';
import { Input } from '@/shared/ui/input';
import { Button } from '@/shared/ui/button';
import {
  getArizProjects,
  submitPublicReferral,
  validateReferrerCode,
  validateCampaignCode,
  type ArizProjectPoints,
} from '@/features/referrals/api/client';
import { ROUTES } from '@/shared/config/routes';

interface ReferralModalProps {
  open: boolean;
  onClose: () => void;
  /** Código de referente precargado (opcional). Si se proporciona, se autovalida y va directo al formulario. */
  preloadedCode?: string;
}

interface FormErrors {
  referrerName?: string;
  referrerEmail?: string;
  referrerPhone?: string;
  referrerCode?: string;
  referrerPayment?: string;
  name?: string;
  email?: string;
  phone?: string;
  interest?: string;
  availability?: string;
  project?: string;
  campaignCode?: string;
}

type ModalView = 'initial' | 'existing-code' | 'existing-form' | 'new-step1' | 'new-step2' | 'new-step3';
type PaymentMethod = '' | 'bank' | 'yape' | 'plin';

/** Opción solo de pantalla: se envía como COMPRA_LOTE con el proyecto Ariz elegido. */
const ARIZ_PROJECT_INTEREST = 'PROYECTO_ARIZ';
const SKIP_PROJECT = 'SKIP';

const INTEREST_OPTIONS = [
  { value: ARIZ_PROJECT_INTEREST, label: 'Vender proyecto o comprar lotes' },
  { value: 'VENTA', label: 'Venta' },
  { value: 'COMPRA', label: 'Compra' },
  { value: 'INVERSION', label: 'Comprar en proyecto' },
  { value: 'ALQUILER', label: 'Alquilar' },
  { value: 'COMPRA_LOTE', label: 'Comprar un lote' },
  { value: 'CORRETAJE', label: 'Servicio de corretaje' },
] as const;

const AVAILABILITY_OPTIONS = [
  { value: 'INMEDIATA', label: 'Inmediata' },
  { value: 'AVERIGUAR', label: 'Averiguar' },
  { value: 'POR_CONFIRMAR', label: 'Por confirmar' },
] as const;

const BANK_OPTIONS = ['BBVA', 'BCP', 'Interbank', 'Scotiabank', 'Banco de la Nación'] as const;

const INTEREST_DETAIL_OPTIONS: Partial<Record<(typeof INTEREST_OPTIONS)[number]['value'], readonly string[]>> = {
  COMPRA: ['Comprar propiedades', 'Comprar proyectos', 'Comprar terrenos', 'Comprar lotes'],
  VENTA: ['Vender propiedad', 'Vender terreno', 'Vender lote', 'Vender proyecto'],
  ALQUILER: ['Alquilar propiedad', 'Publicar alquiler'],
  COMPRA_LOTE: ['Lote urbano', 'Lote campestre', 'Lote de playa', 'Lote para inversión'],
  INVERSION: ['Proyecto inmobiliario', 'Terrenos', 'Lotes', 'Oportunidad de inversión'],
  CORRETAJE: ['Comprar con corretaje', 'Vender con corretaje', 'Alquilar con corretaje'],
};

/** Correo real: usuario@dominio.tld (TLD alfabético de 2+ letras, sin puntos dobles). */
const EMAIL_REGEX = /^[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?\.)+[A-Za-z]{2,}$/;

function isValidEmail(value: string): boolean {
  return EMAIL_REGEX.test(value.trim());
}

/**
 * Celular de Perú. El usuario escribe SOLO los 9 dígitos que empiezan en 9
 * (ej. 923 655 566); el prefijo de país 51 se agrega al enviar (buildPeruPhone).
 */
function isValidPeruPhone(value: string): boolean {
  return /^9\d{8}$/.test(value.replace(/\D/g, ''));
}

/** Devuelve el celular en formato internacional 51 + 9 dígitos (ej. 51923655566). */
function buildPeruPhone(value: string): string {
  return `51${value.replace(/\D/g, '')}`;
}

export function ReferralModal({ open, onClose, preloadedCode }: ReferralModalProps) {
  const router = useRouter();
  const [view, setView] = useState<ModalView>('initial');
  const [submitting, setSubmitting] = useState(false);
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const [referrerName, setReferrerName] = useState('');
  const [referrerEmail, setReferrerEmail] = useState('');
  const [referrerPhone, setReferrerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('');
  const [referrerBank, setReferrerBank] = useState('');
  const [referrerBankAccount, setReferrerBankAccount] = useState('');
  const [referrerYape, setReferrerYape] = useState('');
  const [referrerPlin, setReferrerPlin] = useState('');
  const [referrerCode, setReferrerCode] = useState('');
  const [validatedReferrer, setValidatedReferrer] = useState<{ id: string; name: string; email: string; phone: string } | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [interest, setInterest] = useState('');
  const [availability, setAvailability] = useState('');
  const [interestDetail, setInterestDetail] = useState('');
  const [arizProjects, setArizProjects] = useState<ArizProjectPoints[] | null>(null);
  const [projectChoice, setProjectChoice] = useState('');
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [campaignCode, setCampaignCode] = useState('');
  const [validatedCampaign, setValidatedCampaign] = useState<{ id: string; name: string } | null>(null);
  const [validatingCampaign, setValidatingCampaign] = useState(false);

  useEffect(() => {
    if (!open || interest !== ARIZ_PROJECT_INTEREST || arizProjects !== null) return;
    let active = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- indica la carga al abrir la lista de proyectos.
    setLoadingProjects(true);
    getArizProjects()
      .then((projects) => active && setArizProjects(projects))
      .catch(() => active && setArizProjects([]))
      .finally(() => active && setLoadingProjects(false));
    return () => {
      active = false;
    };
  }, [open, interest, arizProjects]);

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

  // Auto-validar código precargado cuando se abre el modal
  useEffect(() => {
    if (open && preloadedCode && !validatedReferrer) {
      const autoValidate = async () => {
        setValidating(true);
        setError(null);
        setErrors({});
        try {
          const result = await validateReferrerCode(preloadedCode.trim().toUpperCase());
          if (result.valid && result.referrer) {
            setReferrerCode(preloadedCode.trim().toUpperCase());
            setValidatedReferrer(result.referrer);
            setView('existing-form');
          } else {
            setErrors({ referrerCode: 'Código no válido.' });
          }
        } catch (cause) {
          setError(cause instanceof Error ? cause.message : 'No se pudo validar el código.');
        } finally {
          setValidating(false);
        }
      };
      autoValidate();
    }
  }, [open, preloadedCode, validatedReferrer]);

  if (!open || typeof document === 'undefined') return null;

  async function handleValidateCode() {
    if (!referrerCode.trim()) {
      setErrors({ referrerCode: 'Ingresa tu código de referente.' });
      return;
    }

    // Validar formato: APCOD-XXXXXXXX
    const codeRegex = /^APCOD-[A-Z0-9]{8}$/;
    if (!codeRegex.test(referrerCode.trim())) {
      setErrors({ referrerCode: 'Formato inválido. Debe ser APCOD-XXXXXXXX.' });
      return;
    }

    setValidating(true);
    setError(null);
    setErrors({});

    try {
      const result = await validateReferrerCode(referrerCode.trim());
      if (result.valid && result.referrer) {
        // El referente ya tiene código: lo llevamos a su espacio de recompensas
        // (catálogo de canjes) pasando el código para que se valide automáticamente.
        onClose();
        router.push(`${ROUTES.rewards}?code=${encodeURIComponent(referrerCode.trim())}`);
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
    else if (!isValidEmail(referrerEmail)) next.referrerEmail = 'Ingresa un correo válido, por ejemplo nombre@correo.com.';
    if (!referrerPhone.trim()) next.referrerPhone = 'Ingresa tu teléfono.';
    else if (!isValidPeruPhone(referrerPhone)) next.referrerPhone = 'Ingresa tu celular de 9 dígitos (ej. 923 655 566).';
    if (!paymentMethod) {
      next.referrerPayment = 'Elige cómo quieres recibir tus recompensas.';
    } else if (paymentMethod === 'bank') {
      if (!referrerBank) next.referrerPayment = 'Elige el banco de tu cuenta.';
      else if (!/^\d{14}$/.test(referrerBankAccount)) next.referrerPayment = 'Ingresa un número de cuenta de 14 dígitos.';
    } else if (paymentMethod === 'yape' && !/^9\d{8}$/.test(referrerYape)) {
      next.referrerPayment = 'Ingresa un número Yape de 9 dígitos que empiece con 9.';
    } else if (paymentMethod === 'plin' && !/^9\d{8}$/.test(referrerPlin)) {
      next.referrerPayment = 'Ingresa un número Plin de 9 dígitos que empiece con 9.';
    }
    return next;
  }

  function validateNewStep2(): FormErrors {
    const next: FormErrors = {};
    if (!name.trim()) next.name = 'Ingresa el nombre del referido.';
    if (!email.trim()) next.email = 'Ingresa el correo del referido.';
    else if (!isValidEmail(email)) next.email = 'Ingresa un correo válido, por ejemplo nombre@correo.com.';
    if (!phone.trim()) next.phone = 'Ingresa el teléfono del referido.';
    else if (!isValidPeruPhone(phone)) next.phone = 'Ingresa un celular de 9 dígitos (ej. 923 655 566).';
    return next;
  }

  function validateExistingForm(): FormErrors {
    const next: FormErrors = {};
    if (!name.trim()) next.name = 'Ingresa el nombre del referido.';
    if (!email.trim()) next.email = 'Ingresa el correo del referido.';
    else if (!isValidEmail(email)) next.email = 'Ingresa un correo válido, por ejemplo nombre@correo.com.';
    if (!phone.trim()) next.phone = 'Ingresa el teléfono del referido.';
    else if (!isValidPeruPhone(phone)) next.phone = 'Ingresa un celular de 9 dígitos (ej. 923 655 566).';
    if (!interest) next.interest = 'Selecciona qué desea hacer.';
    if (interest === ARIZ_PROJECT_INTEREST && !projectChoice) {
      next.project = 'Elige un proyecto Ariz o selecciona "Omitir proyecto".';
    }
    if (!availability) next.availability = 'Selecciona la disponibilidad.';
    return next;
  }

  function validatePreferences(): FormErrors {
    const next: FormErrors = {};
    if (!interest) next.interest = 'Selecciona qué desea hacer.';
    if (interest === ARIZ_PROJECT_INTEREST && !projectChoice) {
      next.project = 'Elige un proyecto Ariz o selecciona "Omitir proyecto".';
    }
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

  function handleNewStep2Next() {
    const step2Errors = validateNewStep2();
    setErrors(step2Errors);
    if (Object.keys(step2Errors).length === 0) {
      setView('new-step3');
    }
  }

  async function handleValidateCampaignCode() {
    if (!campaignCode.trim()) {
      setValidatedCampaign(null);
      setErrors((prev) => ({ ...prev, campaignCode: undefined }));
      return;
    }

    setValidatingCampaign(true);
    setErrors((prev) => ({ ...prev, campaignCode: undefined }));

    try {
      const result = await validateCampaignCode(campaignCode.trim());
      if (result.valid && result.campaign) {
        setValidatedCampaign(result.campaign);
      } else {
        setValidatedCampaign(null);
        setErrors((prev) => ({ ...prev, campaignCode: result.message || 'Código no válido' }));
      }
    } catch (cause) {
      setValidatedCampaign(null);
      setErrors((prev) => ({ ...prev, campaignCode: 'No se pudo validar el código de campaña' }));
    } finally {
      setValidatingCampaign(false);
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    
    let validationErrors: FormErrors;
    
    if (view === 'existing-form') {
      validationErrors = validateExistingForm();
    } else if (view === 'new-step3') {
      validationErrors = validatePreferences();
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
            referrerPhone: buildPeruPhone(validatedReferrer.phone),
            referrerCode: referrerCode.trim(),
            name: name.trim(),
            email: email.trim(),
            phone: buildPeruPhone(phone),
            interest: interest === ARIZ_PROJECT_INTEREST ? 'COMPRA_LOTE' : interest,
            availability,
            projectId: interest === ARIZ_PROJECT_INTEREST && projectChoice && projectChoice !== SKIP_PROJECT ? projectChoice : undefined,
            campaignCode: validatedCampaign ? campaignCode.trim() : undefined,
          }
        : {
            referrerName: referrerName.trim(),
            referrerEmail: referrerEmail.trim(),
            referrerPhone: buildPeruPhone(referrerPhone),
            referrerCode: referrerCode.trim() || undefined,
            referrerBankAccount:
              paymentMethod === 'bank' ? `${referrerBank} - ${referrerBankAccount}` : undefined,
            referrerYape: paymentMethod === 'yape' ? referrerYape : undefined,
            referrerPlin: paymentMethod === 'plin' ? referrerPlin : undefined,
            name: name.trim(),
            email: email.trim(),
            phone: buildPeruPhone(phone),
            interest: interest === ARIZ_PROJECT_INTEREST ? 'COMPRA_LOTE' : interest,
            availability,
            projectId: interest === ARIZ_PROJECT_INTEREST && projectChoice && projectChoice !== SKIP_PROJECT ? projectChoice : undefined,
            campaignCode: validatedCampaign ? campaignCode.trim() : undefined,
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
    setPaymentMethod('');
    setReferrerBank('');
    setReferrerBankAccount('');
    setReferrerYape('');
    setReferrerPlin('');
    setReferrerCode('');
    setValidatedReferrer(null);
    setName('');
    setEmail('');
    setPhone('');
    setInterest('');
    setAvailability('');
    setInterestDetail('');
    setProjectChoice('');
    onClose();
  }

  function handleBack() {
    if (view === 'existing-form') {
      setView('existing-code');
      setValidatedReferrer(null);
    } else if (view === 'new-step3') {
      setView('new-step2');
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

  function renderPreferenceFields() {
    const details = INTEREST_DETAIL_OPTIONS[interest as keyof typeof INTEREST_DETAIL_OPTIONS] ?? [];

    return (
      <>
        <div className="flex flex-col gap-1.5">
          <span className="text-[13px] font-semibold text-brand">
            ¿Qué desea hacer?
          </span>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {INTEREST_OPTIONS.map((option) => (
              <label
                key={option.value}
                className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${
                  interest === option.value
                    ? 'border-brand bg-brand-soft'
                    : 'border-edge hover:border-brand/50'
                }`}
              >
                <input
                  type="radio"
                  name="interest"
                  value={option.value}
                  checked={interest === option.value}
                  onChange={(e) => {
                    setInterest(e.target.value);
                    setInterestDetail('');
                    setProjectChoice('');
                  }}
                  className="size-4 accent-brand"
                />
                <span className="text-sm text-ink">{option.label}</span>
              </label>
            ))}
          </div>
          {errors.interest && (
            <p className="text-xs font-medium text-error">{errors.interest}</p>
          )}
        </div>

        {details.length > 0 ? (
          <div className="flex flex-col gap-1.5">
            <span className="text-[13px] font-semibold text-brand">
              Elige una opción
            </span>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {details.map((detail) => (
                <button
                  key={detail}
                  type="button"
                  onClick={() => setInterestDetail(detail)}
                  className={`rounded-lg border p-3 text-left text-sm font-semibold transition-colors ${
                    interestDetail === detail
                      ? 'border-brand bg-brand text-on-brand'
                      : 'border-edge text-ink hover:border-brand/50 hover:bg-brand-soft'
                  }`}
                >
                  {detail}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {interest === ARIZ_PROJECT_INTEREST ? (
          <div className="flex flex-col gap-1.5">
            <span className="text-[13px] font-semibold text-brand">Elige el proyecto Ariz</span>
            {loadingProjects ? (
              <p className="text-xs text-muted">Cargando proyectos...</p>
            ) : (
              <div className="grid grid-cols-1 gap-2">
                {(arizProjects ?? []).map((project) => (
                  <button
                    key={project.id}
                    type="button"
                    onClick={() => {
                      setProjectChoice(project.id);
                      setErrors((prev) => ({ ...prev, project: undefined }));
                    }}
                    className={`rounded-lg border p-3 text-left transition-colors ${
                      projectChoice === project.id
                        ? 'border-brand bg-brand text-on-brand'
                        : 'border-edge text-ink hover:border-brand/50 hover:bg-brand-soft'
                    }`}
                  >
                    <span className="block text-sm font-semibold">{project.name}</span>
                    <span
                      className={`mt-0.5 block text-[11px] font-semibold ${
                        projectChoice === project.id ? 'text-white/85' : 'text-accent'
                      }`}
                    >
                      {project.totalExtraPoints > 0
                        ? `Puntos adicionales: +${project.points.CONTACTED} al contactar · +${project.points.VISIT} en visita · +${project.points.OPERATION_COMPLETED} al concretar`
                        : 'Sin puntos adicionales'}
                    </span>
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setProjectChoice(SKIP_PROJECT);
                    setErrors((prev) => ({ ...prev, project: undefined }));
                  }}
                  className={`rounded-lg border p-3 text-left text-sm font-semibold transition-colors ${
                    projectChoice === SKIP_PROJECT
                      ? 'border-brand bg-brand text-on-brand'
                      : 'border-dashed border-edge text-muted hover:border-brand/50 hover:bg-brand-soft'
                  }`}
                >
                  Omitir proyecto
                </button>
              </div>
            )}
            {errors.project && <p className="text-xs font-medium text-error">{errors.project}</p>}
          </div>
        ) : null}

        <div className="flex flex-col gap-1.5">
          <span className="text-[13px] font-semibold text-brand">
            Disponibilidad
          </span>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {AVAILABILITY_OPTIONS.map((option) => (
              <label
                key={option.value}
                className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${
                  availability === option.value
                    ? 'border-brand bg-brand-soft'
                    : 'border-edge hover:border-brand/50'
                }`}
              >
                <input
                  type="radio"
                  name="availability"
                  value={option.value}
                  checked={availability === option.value}
                  onChange={(e) => setAvailability(e.target.value)}
                  className="size-4 accent-brand"
                />
                <span className="text-sm text-ink">{option.label}</span>
              </label>
            ))}
          </div>
          {errors.availability && (
            <p className="text-xs font-medium text-error">{errors.availability}</p>
          )}
        </div>
      </>
    );
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-brand/45 p-4 backdrop-blur-sm"
      onMouseDown={(event) => event.target === event.currentTarget && handleClose()}
    >
      <section
        className="flex max-h-[calc(100dvh-2rem)] w-full max-w-md flex-col overflow-hidden rounded-card border border-edge bg-surface shadow-[var(--shadow-pop)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="referral-modal-title"
      >
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-edge bg-brand p-6">
          <div className="flex-1 text-center">
            <h2 id="referral-modal-title" className="font-display text-2xl font-black text-white">
              Bienvenidos al Ariz Club, Refiere, Gana, Acumula y disfruta.
            </h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="text-2xl leading-none text-white/80 transition-colors hover:text-white"
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
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
                  <p className="font-bold text-ink">Soy miembro de Ariz Club</p>
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
                  <p className="font-bold text-ink">Quiero inscribirme para ser miembro de Ariz Club</p>
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
              placeholder="APCOD-XXXXXXXX"
              value={referrerCode}
              onChange={(e) => setReferrerCode(e.target.value.toUpperCase())}
              error={errors.referrerCode}
              required
              maxLength={14}
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
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  leading="+51"
                  placeholder="923 655 566"
                  maxLength={9}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  error={errors.phone}
                  hint="Solo 9 dígitos; el +51 se agrega automáticamente."
                  required
                />
                <div className="border-t border-edge pt-4">
                  <Input
                    label="Código de campaña (opcional)"
                    placeholder="CAMP-XXXXXXXX"
                    value={campaignCode}
                    onChange={(e) => {
                      setCampaignCode(e.target.value.toUpperCase());
                      if (validatedCampaign) setValidatedCampaign(null);
                    }}
                    onBlur={handleValidateCampaignCode}
                    error={errors.campaignCode}
                    hint="Si tienes un código de campaña, ingrésalo para sumar puntos a esa campaña."
                    maxLength={14}
                    disabled={validatingCampaign}
                  />
                  {validatedCampaign && (
                    <p className="mt-2 text-xs font-semibold text-success">
                      ✓ Campaña válida: {validatedCampaign.name}
                    </p>
                  )}
                </div>
                {renderPreferenceFields()}
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
            {renderStepper(1, 3)}
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
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  leading="+51"
                  placeholder="923 655 566"
                  maxLength={9}
                  value={referrerPhone}
                  onChange={(e) => setReferrerPhone(e.target.value)}
                  error={errors.referrerPhone}
                  hint="Solo 9 dígitos; el +51 se agrega automáticamente."
                  required
                />
                <div className="flex flex-col gap-2">
                  <span className="text-sm font-bold text-ink">
                    ¿Cómo quieres recibir tus recompensas?
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: 'bank', label: 'Cuenta' },
                      { value: 'yape', label: 'Yape' },
                      { value: 'plin', label: 'Plin' },
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          setPaymentMethod(option.value as PaymentMethod);
                          setErrors((current) => ({ ...current, referrerPayment: undefined }));
                        }}
                        className={`h-10 rounded-lg border px-2 text-xs font-black transition-colors ${
                          paymentMethod === option.value
                            ? 'border-brand bg-brand text-on-brand'
                            : 'border-edge bg-surface text-brand hover:border-brand hover:bg-brand-soft'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                  {errors.referrerPayment ? (
                    <p className="text-xs font-medium text-error">{errors.referrerPayment}</p>
                  ) : (
                    <p className="text-xs text-muted">Elige una opción: cuenta bancaria, Yape o Plin.</p>
                  )}
                </div>
                {paymentMethod === 'bank' ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="flex flex-col gap-1.5">
                      <span className="text-[13px] font-semibold text-brand">
                        Banco
                      </span>
                      <span className="relative">
                        <select
                          value={referrerBank}
                          onChange={(event) => {
                            setReferrerBank(event.target.value);
                            setErrors((current) => ({ ...current, referrerPayment: undefined }));
                          }}
                          className="h-11 w-full appearance-none rounded-card border border-brand/35 bg-surface px-3.5 pr-10 text-sm font-semibold text-ink shadow-[var(--shadow-card)] transition-colors outline-none hover:border-brand focus:border-brand focus:outline-2 focus:outline-brand/25"
                        >
                          <option value="">Elige banco</option>
                          {BANK_OPTIONS.map((bank) => (
                            <option key={bank} value={bank}>
                              {bank}
                            </option>
                          ))}
                        </select>
                        <span
                          aria-hidden
                          className="pointer-events-none absolute top-1/2 right-3 flex size-6 -translate-y-1/2 items-center justify-center rounded-full bg-brand-soft text-xs font-black text-brand"
                        >
                          ▼
                        </span>
                      </span>
                    </label>
                    <Input
                      label="Número de cuenta"
                      type="tel"
                      inputMode="numeric"
                      placeholder="14 dígitos"
                      maxLength={14}
                      value={referrerBankAccount}
                      onChange={(e) => setReferrerBankAccount(e.target.value.replace(/\D/g, '').slice(0, 14))}
                      hint="Solo 14 números."
                    />
                  </div>
                ) : null}
                {paymentMethod === 'yape' ? (
                  <Input
                    label="Yape"
                    type="tel"
                    inputMode="numeric"
                    placeholder="Número Yape"
                    maxLength={9}
                    value={referrerYape}
                    onChange={(e) => setReferrerYape(e.target.value.replace(/\D/g, '').slice(0, 9))}
                    hint="Solo 9 números, debe empezar con 9."
                  />
                ) : null}
                {paymentMethod === 'plin' ? (
                  <Input
                    label="Plin"
                    type="tel"
                    inputMode="numeric"
                    placeholder="Número Plin"
                    maxLength={9}
                    value={referrerPlin}
                    onChange={(e) => setReferrerPlin(e.target.value.replace(/\D/g, '').slice(0, 9))}
                    hint="Solo 9 números, debe empezar con 9."
                  />
                ) : null}
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
            {renderStepper(2, 3)}
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
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  leading="+51"
                  placeholder="923 655 566"
                  maxLength={9}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  error={errors.phone}
                  hint="Solo 9 dígitos; el +51 se agrega automáticamente."
                  required
                />
                {error && (
                  <p className="rounded-lg bg-error/10 p-3 text-sm font-semibold text-error">{error}</p>
                )}

                <div className="mt-2 flex gap-3">
                  <Button type="button" variant="secondary" onClick={handleBack} className="flex-1">
                    Atrás
                  </Button>
                  <Button type="button" onClick={handleNewStep2Next} className="flex-1">
                    Continuar
                  </Button>
                </div>
              </div>
            </form>
          </>
        ) : view === 'new-step3' ? (
          <>
            {renderStepper(3, 3)}
            <form onSubmit={handleSubmit} className="p-6">
              <p className="mb-4 text-sm font-semibold text-ink">
                Preferencias del referido
              </p>
              <div className="flex flex-col gap-4">
                {renderPreferenceFields()}
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
        </div>
      </section>
    </div>,
    document.body,
  );
}
