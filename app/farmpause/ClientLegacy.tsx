'use client';

import dynamic from 'next/dynamic';
import React from 'react';

const GADStaking = dynamic(() => import('../components/GADStaking'), {
  ssr: false,
  loading: () => <div className="mt-6 text-sm text-white/60">Loading legacy single-staking…</div>,
});

export default function ClientLegacy() {
  return <GADStaking />;
}
