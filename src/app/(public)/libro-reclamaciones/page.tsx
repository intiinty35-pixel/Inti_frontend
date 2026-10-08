import type { Metadata } from 'next';
import { Container } from '@/shared/ui';
import { ClaimBookPage } from '@/features/claims/components/claim-book-page';

export const metadata: Metadata = {
  title: 'Libro de Reclamaciones - ARIZ GROUP S.A.C.',
  description: 'Registra tus reclamaciones y quejas de acuerdo con la normativa vigente.',
};

export default function ClaimsBookPublicPage() {
  return (
    <Container className="py-12">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-accent">
            ARIZ GROUP S.A.C.
          </p>
          <h1 className="mt-2 font-display text-3xl font-black text-brand sm:text-4xl">
            Libro de Reclamaciones
          </h1>
          <p className="mt-3 text-sm text-muted">
            Registra aquí tus reclamaciones o quejas. Recibirás un código único para hacer seguimiento de tu solicitud.
          </p>
        </div>
        <ClaimBookPage />
      </div>
    </Container>
  );
}
