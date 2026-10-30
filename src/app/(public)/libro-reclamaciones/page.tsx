import type { Metadata } from "next";
import { ClaimBookPage } from "@/features/claims/components/claim-book-page";

export const metadata: Metadata = {
  title: "Libro de Reclamaciones - INTI GROUP S.A.C.",
  description: "Registra tus reclamaciones y quejas de acuerdo con la normativa vigente.",
};

export default function ClaimsBookPublicPage() {
  return (
    <main className="bg-[#f1efea] px-4 py-8 sm:py-12">
      <ClaimBookPage />
    </main>
  );
}
