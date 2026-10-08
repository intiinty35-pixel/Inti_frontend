"use client";

import { useState } from "react";
import { ClaimForm } from "@/features/claims/components/claim-form";
import { ClaimSuccess } from "@/features/claims/components/claim-success";
import type { ClaimResponse } from "@/features/claims/api/client";

export function ClaimBookPage() {
  const [submittedClaim, setSubmittedClaim] = useState<ClaimResponse | null>(null);

  function handleSuccess(response: ClaimResponse) {
    setSubmittedClaim(response);
  }

  function handleClose() {
    setSubmittedClaim(null);
  }

  if (submittedClaim) {
    return (
      <div className="mx-auto max-w-4xl">
        <ClaimSuccess claim={submittedClaim} onClose={handleClose} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[820px]">
      <ClaimForm onSuccess={handleSuccess} />
    </div>
  );
}
