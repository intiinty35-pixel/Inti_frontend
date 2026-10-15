"use client";

import { useState } from "react";
import { submitPublicClaim, type ClaimInput, type ClaimResponse, type ClaimType } from "@/features/claims/api/client";

const COMPANY_INFO = {
  businessName: "ARIZ GROUP SOCIEDAD ANONIMA CERRADA",
  ruc: "20609623552",
  address: "Jr. Huascar Nro. 310 Int. 01 Otr. Centro Tumbes, Tumbes, Peru",
};

interface FormErrors {
  fullName?: string;
  address?: string;
  dniOrCe?: string;
  email?: string;
  assetType?: string;
  claimedAmount?: string;
  assetDescription?: string;
  type?: string;
  claimDetails?: string;
  consumerRequest?: string;
}

interface ClaimFormProps {
  onSuccess: (response: ClaimResponse) => void;
}

function SectionTitle({ children }: { children: string }) {
  return (
    <div className="border-b border-[#c9d1dc] bg-[#f2f3f5] px-3 py-2 text-[11px] font-black uppercase tracking-wide text-[#001b3f]">
      {children}
    </div>
  );
}

function Row({
  label,
  required,
  children,
  hint,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="grid border-b border-[#d9dee7] md:grid-cols-[205px_minmax(0,1fr)]">
      <div className="border-[#d9dee7] bg-[#fafbfc] px-3 py-2.5 text-[11px] font-bold text-[#001b3f] md:border-r">
        {label}
        {required ? <span className="text-[#e3262e]"> *</span> : null}
        {hint ? <span className="mt-1 block text-[10px] font-semibold text-[#667085]">{hint}</span> : null}
      </div>
      <div className="px-3 py-2">{children}</div>
    </div>
  );
}

const inputClass =
  "h-8 w-full rounded-[2px] border border-[#bfc8d6] bg-white px-2.5 text-[11px] text-[#001b3f] outline-none transition placeholder:text-[#98a2b3] focus:border-[#0b5ed7] focus:ring-1 focus:ring-[#0b5ed7]/20";
const textareaClass =
  "min-h-16 w-full rounded-[2px] border border-[#bfc8d6] bg-white p-2.5 text-[11px] leading-5 text-[#001b3f] outline-none transition placeholder:text-[#98a2b3] focus:border-[#0b5ed7] focus:ring-1 focus:ring-[#0b5ed7]/20";

function FieldError({ message }: { message?: string }) {
  return message ? <p className="mt-1 text-[11px] font-semibold text-[#e3262e]">{message}</p> : null;
}

export function ClaimForm({ onSuccess }: ClaimFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});

  const [fullName, setFullName] = useState("");
  const [address, setAddress] = useState("");
  const [dniOrCe, setDniOrCe] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [parentGuardian, setParentGuardian] = useState("");
  const [assetType, setAssetType] = useState("Servicio");
  const [claimedAmount, setClaimedAmount] = useState("");
  const [assetDescription, setAssetDescription] = useState("");
  const [type, setType] = useState<ClaimType>("Claim");
  const [claimDetails, setClaimDetails] = useState("");
  const [consumerRequest, setConsumerRequest] = useState("");

  function validate(): FormErrors {
    const next: FormErrors = {};
    if (!fullName.trim()) next.fullName = "Campo obligatorio";
    else if (fullName.trim().length < 3) next.fullName = "Minimo 3 caracteres";
    if (!address.trim()) next.address = "Campo obligatorio";
    else if (address.trim().length < 5) next.address = "Minimo 5 caracteres";
    if (!dniOrCe.trim()) next.dniOrCe = "Campo obligatorio";
    else if (dniOrCe.trim().length < 8 || dniOrCe.trim().length > 12) next.dniOrCe = "Debe tener entre 8 y 12 caracteres";
    if (!email.trim()) next.email = "Campo obligatorio";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = "Correo invalido";
    if (!assetType.trim()) next.assetType = "Campo obligatorio";
    const amount = parseFloat(claimedAmount);
    if (!claimedAmount) next.claimedAmount = "Campo obligatorio";
    else if (Number.isNaN(amount) || amount < 0) next.claimedAmount = "Monto invalido";
    if (!assetDescription.trim()) next.assetDescription = "Campo obligatorio";
    else if (assetDescription.trim().length < 10) next.assetDescription = "Minimo 10 caracteres";
    if (!type) next.type = "Campo obligatorio";
    if (!claimDetails.trim()) next.claimDetails = "Campo obligatorio";
    else if (claimDetails.trim().length < 20) next.claimDetails = "Minimo 20 caracteres";
    if (!consumerRequest.trim()) next.consumerRequest = "Campo obligatorio";
    else if (consumerRequest.trim().length < 20) next.consumerRequest = "Minimo 20 caracteres";
    return next;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setSubmitting(true);
    setError(null);

    try {
      const input: ClaimInput = {
        fullName: fullName.trim(),
        address: address.trim(),
        dniOrCe: dniOrCe.trim(),
        phone: phone.trim() || undefined,
        email: email.trim(),
        parentGuardian: parentGuardian.trim() || undefined,
        assetType,
        claimedAmount: parseFloat(claimedAmount),
        assetDescription: assetDescription.trim(),
        type,
        claimDetails: claimDetails.trim(),
        consumerRequest: consumerRequest.trim(),
      };

      const response = await submitPublicClaim(input);
      onSuccess(response);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo enviar el reclamo. Por favor, intentalo de nuevo.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="overflow-hidden rounded-[5px] border border-[#bfc8d6] bg-white shadow-sm">
      <header className="relative border-b border-[#c9d1dc] px-3 py-6 text-center sm:px-5">
        <img src="/logo/logo.png" alt="ARIZ" className="absolute right-3 top-4 h-5 w-auto sm:right-5 sm:top-5 sm:h-6" />
        <h1 className="pr-16 text-[20px] font-black uppercase tracking-wide text-[#001b3f] sm:pr-20">Libro de Reclamaciones</h1>
        <p className="mt-1 text-[11px] font-medium text-[#35445c]">(Ley N° 29571, Codigo de Proteccion y Defensa del Consumidor)</p>
      </header>

      <SectionTitle>I. Datos de la empresa</SectionTitle>
      <Row label="Razon Social">
        <p className="text-[11px] font-semibold text-[#001b3f]">{COMPANY_INFO.businessName}</p>
      </Row>
      <Row label="RUC">
        <p className="text-[11px] font-semibold text-[#001b3f]">{COMPANY_INFO.ruc}</p>
      </Row>
      <Row label="Direccion">
        <p className="text-[11px] font-semibold text-[#001b3f]">{COMPANY_INFO.address}</p>
      </Row>

      <SectionTitle>II. Identificacion del consumidor</SectionTitle>
      <Row label="Nombres y Apellidos" required>
        <input className={inputClass} placeholder="Ingrese sus nombres y apellidos" value={fullName} onChange={(e) => setFullName(e.target.value)} />
        <FieldError message={errors.fullName} />
      </Row>
      <Row label="Domicilio" required>
        <input className={inputClass} placeholder="Ingrese su domicilio" value={address} onChange={(e) => setAddress(e.target.value)} />
        <FieldError message={errors.address} />
      </Row>
      <Row label="DNI / CE" required>
        <input className={inputClass} placeholder="N° de DNI o Carne de Extranjeria" value={dniOrCe} maxLength={12} onChange={(e) => setDniOrCe(e.target.value)} />
        <FieldError message={errors.dniOrCe} />
      </Row>
      <Row label="Telefono">
        <input className={inputClass} placeholder="Telefono de contacto" value={phone} onChange={(e) => setPhone(e.target.value)} />
      </Row>
      <Row label="Correo Electronico" required>
        <input className={inputClass} type="email" placeholder="correo@ejemplo.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        <FieldError message={errors.email} />
      </Row>
      <Row label="Padre o Madre" hint="Si es menor de edad">
        <input className={inputClass} placeholder="Nombre del padre o madre" value={parentGuardian} onChange={(e) => setParentGuardian(e.target.value)} />
      </Row>

      <SectionTitle>III. Identificacion del bien contratado</SectionTitle>
      <Row label="Tipo de Bien" required>
        <div className="flex flex-wrap gap-5 text-[11px] font-semibold text-[#001b3f]">
          {["Producto", "Servicio"].map((option) => (
            <label key={option} className="inline-flex items-center gap-2">
              <input type="radio" name="assetType" checked={assetType === option} onChange={() => setAssetType(option)} />
              {option}
            </label>
          ))}
        </div>
        <FieldError message={errors.assetType} />
      </Row>
      <Row label="Monto Reclamado (S/)" required>
        <input className={`${inputClass} max-w-sm`} type="number" placeholder="0.00" value={claimedAmount} min="0" step="0.01" onChange={(e) => setClaimedAmount(e.target.value)} />
        <FieldError message={errors.claimedAmount} />
      </Row>
      <Row label="Descripcion del Bien" required>
        <textarea className={textareaClass} placeholder="Describa el producto o servicio contratado" value={assetDescription} onChange={(e) => setAssetDescription(e.target.value)} />
        <FieldError message={errors.assetDescription} />
      </Row>

      <SectionTitle>IV. Reclamo o Queja</SectionTitle>
      <Row label="Tipo" required>
        <div className="flex flex-wrap gap-5 text-[11px] font-semibold text-[#001b3f]">
          <label className="inline-flex items-center gap-2">
            <input type="radio" name="type" checked={type === "Claim"} onChange={() => setType("Claim")} />
            Reclamo
          </label>
          <label className="inline-flex items-center gap-2">
            <input type="radio" name="type" checked={type === "Complaint"} onChange={() => setType("Complaint")} />
            Queja
          </label>
        </div>
        <FieldError message={errors.type} />
      </Row>

      <SectionTitle>V. Detalle</SectionTitle>
      <Row label="Detalle de la Reclamacion" required>
        <textarea className={`${textareaClass} min-h-28`} placeholder="Describa detalladamente los hechos que motivan su reclamo o queja..." value={claimDetails} onChange={(e) => setClaimDetails(e.target.value)} />
        <FieldError message={errors.claimDetails} />
      </Row>
      <Row label="Pedido del Consumidor" required>
        <textarea className={`${textareaClass} min-h-24`} placeholder="Que es lo que solicita como solucion?" value={consumerRequest} onChange={(e) => setConsumerRequest(e.target.value)} />
        <FieldError message={errors.consumerRequest} />
      </Row>

      <div className="p-4">
        {error ? <p className="mb-3 rounded-[4px] bg-red-50 px-3 py-2 text-[12px] font-bold text-[#e3262e]">{error}</p> : null}
        <button
          type="submit"
          disabled={submitting}
          className="h-10 w-full rounded-[4px] bg-[#e3262e] text-[12px] font-black uppercase tracking-wide text-white transition hover:bg-[#c91f26] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {submitting ? "Enviando..." : "Enviar Reclamo"}
        </button>
        <p className="mt-3 text-center text-[11px] font-medium text-[#667085]">
          Al enviar, acepta los terminos del Libro de Reclamaciones de ARIZ.
        </p>
      </div>
    </form>
  );
}
