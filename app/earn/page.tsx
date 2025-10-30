'use client';

import dynamic from 'next/dynamic';
import React from 'react';

const FarmingDashboard = dynamic(() => import('../components/FarmingDashboard'), { ssr: false });
const ZapBox           = dynamic(() => import('../components/ZapBox'),           { ssr: false });
const HowToFarm        = dynamic(() => import('../components/HowToFarm'),        { ssr: false });
const GADLocker        = dynamic(() => import('../components/GADLocker').catch(() => null), { ssr: false });

const GAD_TOKEN = '0x858bab88A5b8D7F29a40380C5F2D8d0b8812FE62';
const MASTERCHEF = '0x5C5c0b9eE66CC106f90D7b1a3727dc126C4eF188';
const ZAP = '0x15Acdc7636FB0214aEfa755377CE5ab3a9Cc99BC';
const LOCKER = (process.env.NEXT_PUBLIC_GAD_LOCKER_ADDRESS || '0xYOUR_NEW_LOCKER_ADDRESS').trim();

export default function EarnPage() {
  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      {/* ==== ШАПКА ==== */}
      <h1 className="text-3xl font-extrabold">Liquidity Mining</h1>
      <p className="text-white/70 mt-2">
        Total program: <b>100B GAD</b> • Emissions split by pools (allocPoints)
      </p>

      {/* ==== КОНТРАКТЫ ==== */}
      <div className="mt-4 text-sm text-white/70 space-y-1">
        <p>
          GAD Token:{' '}
          <a
            href={`https://bscscan.com/token/${GAD_TOKEN}`}
            target="_blank" rel="noreferrer"
            className="text-[#ffd166] hover:underline"
          >
            {GAD_TOKEN.slice(0,8)}…{GAD_TOKEN.slice(-4)}
          </a> ✅
        </p>
        <p>
          MasterChef (Farming):{' '}
          <a
            href={`https://bscscan.com/address/${MASTERCHEF}`}
            target="_blank" rel="noreferrer"
            className="text-[#ffd166] hover:underline"
          >
            {MASTERCHEF.slice(0,8)}…{MASTERCHEF.slice(-4)}
          </a> ✅
        </p>
        <p>
          Zap Contract:{' '}
          <a
            href={`https://bscscan.com/address/${ZAP}`}
            target="_blank" rel="noreferrer"
            className="text-[#ffd166] hover:underline"
          >
            {ZAP.slice(0,8)}…{ZAP.slice(-4)}
          </a> ✅
        </p>
        <p>
          Staking (single GAD, Locker v1):{' '}
          <a
            href={`https://bscscan.com/address/${LOCKER}`}
            target="_blank" rel="noreferrer"
            className="text-[#ffd166] hover:underline"
          >
            {LOCKER.slice(0,8)}…{LOCKER.slice(-4)}
          </a> ✅
        </p>
      </div>

      {/* ==== GAD LOCKER (новый single staking) ==== */}
      <section className="mt-10 bg-white/5 border border-white/10 rounded-2xl p-6">
        <h2 className="text-2xl font-bold">Stake GAD → Earn GAD</h2>
        <p className="text-white/80 mt-2">
          Lock periods & APR are read on-chain from the new locker contract. No LP needed — stake GAD directly.
        </p>

        {GADLocker ? (
          <div className="mt-6">
            {/* @ts-ignore: dynamic import may return null at build-time */}
            <GADLocker />
          </div>
        ) : null}
      </section>

      {/* ==== ZAP ==== */}
      <div className="mt-10">
        <ZapBox />
      </div>

      {/* ==== LP FARMING ==== */}
      <div className="mt-10">
        <FarmingDashboard />
      </div>

      {/* ==== HOW TO ==== */}
      <div className="mt-12">
        <HowToFarm />
      </div>
    </main>
  );
}
