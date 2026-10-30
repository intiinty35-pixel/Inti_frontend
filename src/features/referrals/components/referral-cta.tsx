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
        className="inline-flex h-10 min-w-0 flex-1 items-center justify-center rounded-[6px] border border-brand bg-accent px-2 text-center text-[10px] leading-tight font-black text-brand shadow-[0_10px_26px_rgb(0_0_0_/_0.18)] transition-colors hover:bg-[#d99a00] sm:h-11 sm:flex-none sm:px-5 sm:text-sm"
      >
        Únete al Inti Club
      </button>
      <ReferralModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
