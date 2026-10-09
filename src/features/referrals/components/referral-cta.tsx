'use client';

import { useState } from 'react';
import { ReferralModal } from '@/features/referrals/components/referral-modal';

export function ReferralCta() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-11 items-center justify-center rounded-[6px] border border-yellow-400 bg-yellow-400 px-5 text-sm font-black text-ink shadow-[0_10px_26px_rgb(0_0_0_/_0.18)] transition-colors hover:bg-yellow-500"
      >
        Refiere con Ariz
      </button>
      <ReferralModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
