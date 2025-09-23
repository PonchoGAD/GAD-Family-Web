'use client';

import dynamic from 'next/dynamic';
import React from 'react';

const FarmingDashboard = dynamic(() => import('../components/FarmingDashboard'), { ssr: false });
const ZapBox           = dynamic(() => import('../components/ZapBox'),           { ssr: false });
const HowToFarm        = dynamic(() => import('../components/HowToFarm'),        { ssr: false });

// если компонент стейкинга есть — отрендерится; если нет — страница не ломается
const GADStaking = dynamic(() => import('../components/GADStaking').catch(() => null), { ssr: false });

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
            href="https://bscscan.com/token/0x858bab88A5b8D7F29a40380C5F2D8d0b8812FE62"
            target="_blank" rel="noreferrer"
            className="text-[#ffd166] hover:underline"
          >
            0x858bab...FE62
          </a> ✅
        </p>
        <p>
          MasterChef (Farming):{' '}
          <a
            href="https://bscscan.com/address/0x5C5c0b9eE66CC106f90D7b1a3727dc126C4eF188"
            target="_blank" rel="noreferrer"
            className="text-[#ffd166] hover:underline"
          >
            0x5C5c0b...F188
          </a> ✅
        </p>
        <p>
          Zap Contract:{' '}
          <a
            href="https://bscscan.com/address/0x15Acdc7636FB0214aEfa755377CE5ab3a9Cc99BC"
            target="_blank" rel="noreferrer"
            className="text-[#ffd166] hover:underline"
          >
            0x15Acdc...99BC
          </a> ✅
        </p>
        <p>
          Staking (single GAD):{' '}
          <a
            href="https://bscscan.com/address/0x0271167c2b1b1513434ECe38f024434654781594"
            target="_blank" rel="noreferrer"
            className="text-[#ffd166] hover:underline"
          >
            0x027116...1594
          </a> ✅
        </p>
      </div>

      {/* ==== GAD SINGLE STAKING (переставлено ВЫШЕ Zap) ==== */}
      <section className="mt-10 bg-white/5 border border-white/10 rounded-2xl p-6">
        <h2 className="text-2xl font-bold">Stake GAD → Earn GAD</h2>
        <p className="text-white/80 mt-2">
          Lock <b>0d ×1.0</b> / <b>30d ×1.5</b> / <b>90d ×2.5</b> / <b>180d ×3.5</b>. No LP needed — stake GAD directly.
        </p>

        {GADStaking ? (
          <div className="mt-6">
            {/* @ts-ignore: dynamic import may return null at build-time */}
            <GADStaking />
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
