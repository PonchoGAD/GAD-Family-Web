import React from 'react';
import type { Metadata } from 'next';
import ClientLegacy from './ClientLegacy';

export const metadata: Metadata = {
  title: 'Legacy GAD Single Staking (Farmpause)',
  robots: { index: false, follow: false },
};

export default function FarmpausePage() {
  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      <div className="rounded-2xl border border-yellow-500/30 bg-yellow-500/5 p-6">
        <h1 className="text-2xl md:text-3xl font-extrabold">Legacy GAD Single Staking</h1>
        <p className="text-white/70 mt-2">
          This is an archived single-staking pool (legacy). Use it only to manage your existing positions:
          <b className="ml-1">Stake / Unstake / Harvest</b>. New main staking is available on <code>/earn</code>.
        </p>
        <p className="text-xs text-white/50 mt-2">
          Page is hidden from navigation and marked noindex.
        </p>
      </div>

      <section className="mt-8">
        {/* Весь клиентский код — внутри ClientLegacy */}
        <ClientLegacy />
      </section>
    </main>
  );
}
