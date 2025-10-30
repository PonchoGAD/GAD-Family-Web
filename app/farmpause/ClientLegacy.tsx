'use client';

import dynamic from 'next/dynamic';
import React from 'react';

// dynamic в клиентском компоненте безопасен; SSR здесь не будет
const GADStaking = dynamic(() => import('../components/GADStaking'), {
  loading: () => <div className="mt-6 text-sm text-white/60">Loading legacy single-staking…</div>,
  ssr: false,
});

export default function ClientLegacy() {
  return <GADStaking />;
}
