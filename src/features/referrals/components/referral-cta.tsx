'use client';

import { useState } from 'react';
import { ReferralModal } from '@/features/referrals/components/referral-modal';

interface ProjectOption {
  id: string;
  name: string;
}

export function ReferralCta({ projects }: { projects: ProjectOption[] }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-11 items-center justify-center rounded-[6px] border border-[#25D366] bg-white/12 px-5 text-sm font-black text-white backdrop-blur-sm transition-colors hover:bg-white/18"
      >
        Refiere con Ariz
      </button>
      <ReferralModal open={open} onClose={() => setOpen(false)} projects={projects} />
    </>
  );
}
