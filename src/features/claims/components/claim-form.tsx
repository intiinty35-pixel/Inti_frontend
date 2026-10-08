'use client';

import { useState } from 'react';
import { Button, Input, Select, Textarea } from '@/shared/ui';
import { submitPublicClaim, type ClaimInput, type ClaimResponse, type ClaimType } from '@/features/claims/api/client';

const COMPANY_INFO = {
  businessName: 'ARIZ GROUP SOCIEDAD ANONIMA CERRADA',
  ruc: '20609623552',
  address: 'Jr. Huascar Nro. 310 Int. 01 Otr. Centro Tumbes',
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

export function ClaimForm({ onSuccess }: ClaimFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});

  const [fullName, setFullName] = useState('');
  const [address, setAddress] = useState('');
  const [dniOrCe, setDniOrCe] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [parentGuardian, setParentGuardian] = useState('');
  const [assetType, setAssetType] = useState('');
  const [claimedAmount, setClaimedAmount] = useState('');
  const [assetDescription, setAssetDescription] = useState('');
  const [type, setType] = useState<ClaimType | ''>('');
  const [claimDetails, setClaimDetails] = useState('');
  const [consumerRequest, setConsumerRequest] = useState('');

  function validate(): FormErrors {
    const next: FormErrors = {};
    if (!fullName.trim()) next.fullName = 'El nombre completo es obligatorio';
    else if (fullName.trim().length < 3) next.fullName = 'El nombre completo debe tener al menos 3 caracteres';
    if (!address.trim()) next.address = 'La dirección es obligatoria';
    else if (address.trim().length < 5) next.address = 'La dirección debe tener al menos 5 caracteres';
    if (!dniOrCe.trim()) next.dniOrCe = 'El DNI/CE es obligatorio';
    else if (dniOrCe.trim().length < 8 || dniOrCe.trim().length > 12) next.dniOrCe = 'El DNI/CE debe tener entre 8 y 12 caracteres';
    if (!email.trim()) next.email = 'El correo electrónico es obligatorio';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = 'Ingresa un correo electrónico válido';
    if (!assetType.trim()) next.assetType = 'El tipo de bien es obligatorio';
    const amount = parseFloat(claimedAmount);
    if (!claimedAmount) next.claimedAmount = 'El monto reclamado es obligatorio';
    else if (isNaN(amount) || amount < 0) next.claimedAmount = 'El monto debe ser un número positivo';
    if (!assetDescription.trim()) next.assetDescription = 'La descripción del bien es obligatoria';
    else if (assetDescription.trim().length < 10) next.assetDescription = 'La descripción debe tener al menos 10 caracteres';
    if (!type) next.type = 'El tipo de reclamación es obligatorio';
    if (!claimDetails.trim()) next.claimDetails = 'Los detalles del reclamo son obligatorios';
    else if (claimDetails.trim().length < 20) next.claimDetails = 'Los detalles deben tener al menos 20 caracteres';
    if (!consumerRequest.trim()) next.consumerRequest = 'El pedido del consumidor es obligatorio';
    else if (consumerRequest.trim().length < 20) next.consumerRequest = 'El pedido debe tener al menos 20 caracteres';
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
        assetType: assetType.trim(),
        claimedAmount: parseFloat(claimedAmount),
        assetDescription: assetDescription.trim(),
        type: type as ClaimType,
        claimDetails: claimDetails.trim(),
        consumerRequest: consumerRequest.trim(),
      };

      const response = await submitPublicClaim(input);
      onSuccess(response);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo enviar el reclamo. Por favor, inténtalo de nuevo.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      {/* Section 01 - Company Information */}
      <section className="rounded-card border border-edge bg-surface p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-full bg-brand text-sm font-black text-on-brand">
            1
          </div>
          <h2 className="font-display text-lg font-bold text-brand">Información de la Empresa</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-muted">Razón Social</p>
            <p className="mt-1 text-sm font-semibold text-ink">{COMPANY_INFO.businessName}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-muted">RUC</p>
            <p className="mt-1 text-sm font-semibold text-ink">{COMPANY_INFO.ruc}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-muted">Dirección</p>
            <p className="mt-1 text-sm font-semibold text-ink">{COMPANY_INFO.address}</p>
          </div>
        </div>
      </section>

      {/* Section 02 - Consumer Identification */}
      <section className="rounded-card border border-edge bg-surface p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-full bg-brand text-sm font-black text-on-brand">
            2
          </div>
          <h2 className="font-display text-lg font-bold text-brand">Identificación del Consumidor</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Nombre Completo *"
            placeholder="Ej. Juan Pérez García"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            error={errors.fullName}
            required
          />
          <Input
            label="Dirección *"
            placeholder="Calle, número, distrito, ciudad"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            error={errors.address}
            required
          />
          <Input
            label="DNI / CE *"
            placeholder="8-12 dígitos"
            value={dniOrCe}
            onChange={(e) => setDniOrCe(e.target.value)}
            error={errors.dniOrCe}
            required
            maxLength={12}
          />
          <Input
            label="Teléfono"
            placeholder="+51 999 999 999"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <Input
            label="Correo Electrónico *"
            type="email"
            placeholder="email@ejemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            required
          />
          <Input
            label="Padre o Madre (si es menor)"
            placeholder="Nombre completo"
            value={parentGuardian}
            onChange={(e) => setParentGuardian(e.target.value)}
          />
        </div>
      </section>

      {/* Section 03 - Contracted Asset Identification */}
      <section className="rounded-card border border-edge bg-surface p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-full bg-brand text-sm font-black text-on-brand">
            3
          </div>
          <h2 className="font-display text-lg font-bold text-brand">Identificación del Bien Contratado</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Tipo de Bien *"
            placeholder="Ej. Servicio, Producto, Inmueble"
            value={assetType}
            onChange={(e) => setAssetType(e.target.value)}
            error={errors.assetType}
            required
          />
          <Input
            label="Monto Reclamado (S/)"
            type="number"
            placeholder="0.00"
            value={claimedAmount}
            onChange={(e) => setClaimedAmount(e.target.value)}
            error={errors.claimedAmount}
            min="0"
            step="0.01"
          />
          <div className="sm:col-span-2">
            <Textarea
              label="Descripción del Bien *"
              placeholder="Describe detalladamente el bien contratado..."
              value={assetDescription}
              onChange={(e) => setAssetDescription(e.target.value)}
              error={errors.assetDescription}
              required
              rows={3}
            />
          </div>
        </div>
      </section>

      {/* Section 04 - Claim or Complaint */}
      <section className="rounded-card border border-edge bg-surface p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-full bg-brand text-sm font-black text-on-brand">
            4
          </div>
          <h2 className="font-display text-lg font-bold text-brand">Reclamo o Queja</h2>
        </div>
        <div className="grid gap-4">
          <Select
            label="Tipo *"
            value={type}
            onChange={(e) => setType(e.target.value as ClaimType)}
            error={errors.type}
            required
          >
            <option value="">Selecciona el tipo</option>
            <option value="Claim">Reclamo</option>
            <option value="Complaint">Queja</option>
          </Select>
        </div>
      </section>

      {/* Section 05 - Details */}
      <section className="rounded-card border border-edge bg-surface p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-full bg-brand text-sm font-black text-on-brand">
            5
          </div>
          <h2 className="font-display text-lg font-bold text-brand">Detalles</h2>
        </div>
        <div className="flex flex-col gap-4">
          <Textarea
            label="Detalles del Reclamo *"
            placeholder="Describe detalladamente los hechos, fechas y circunstancias relacionadas con tu reclamo..."
            value={claimDetails}
            onChange={(e) => setClaimDetails(e.target.value)}
            error={errors.claimDetails}
            required
            rows={5}
          />
          <Textarea
            label="Pedido del Consumidor *"
            placeholder="Indica qué es lo que solicitas (devolución, cambio, solución, etc.)..."
            value={consumerRequest}
            onChange={(e) => setConsumerRequest(e.target.value)}
            error={errors.consumerRequest}
            required
            rows={4}
          />
        </div>
      </section>

      {error && (
        <p className="rounded-lg bg-error/10 p-3 text-sm font-semibold text-error">{error}</p>
      )}
      <div className="flex justify-center">
        <Button
          type="submit"
          disabled={submitting}
          className="w-fit px-8 cursor-pointer"
        >
          {submitting ? 'Enviando...' : 'Enviar Reclamo'}
        </Button>
      </div>
    </form>
  );
}
